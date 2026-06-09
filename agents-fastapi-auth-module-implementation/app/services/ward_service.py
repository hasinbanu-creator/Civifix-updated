"""Ward service with business logic"""
from typing import Optional, Tuple, List
from bson import ObjectId
from datetime import datetime
import logging

from app.models.ward_model import ward_document
from app.repositories.ward_repository import WardRepository
from app.schemas.complaint_schema import WardCreateSchema, WardUpdateSchema
from app.core.exceptions import CivifixException, ResourceNotFoundError, ValidationError

logger = logging.getLogger(__name__)


class WardService:
    """Service for ward operations"""

    def __init__(self, ward_repo: WardRepository, user_repo=None, district_repo=None):
        self.ward_repo = ward_repo
        self.user_repo = user_repo
        self.district_repo = district_repo

    async def create_ward(
        self,
        ward_data: WardCreateSchema,
        created_by_id: str
    ) -> dict:
        """Create a new ward with validations"""
        try:
            district = None
            if self.district_repo:
                district = await self.district_repo.find_by_id(ward_data.district_id)
                if not district:
                    raise ValidationError("District not found")

            # Validate inspector exists and has correct role
            if self.user_repo:
                inspector = await self.user_repo.get_by_id(ward_data.inspector_id)
                if not inspector:
                    raise ValidationError("Inspector not found")

                if inspector.get("role") != "INSPECTOR":
                    raise ValidationError("User is not an inspector")

                await self._validate_inspector_district(inspector, ward_data.district_id, district)

            # Check for duplicate ward number in district
            existing_ward = await self.ward_repo.get_by_ward_number(
                ward_data.ward_number,
                ward_data.district_id
            )
            if existing_ward:
                raise ValidationError(f"Ward number {ward_data.ward_number} already exists in this district")

            # Create ward document
            ward_doc = ward_document(ward_data)
            ward_doc["created_by"] = ObjectId(created_by_id)
            ward_doc["district_id"] = ObjectId(ward_data.district_id)
            ward_doc["inspector_id"] = ObjectId(ward_data.inspector_id)

            # Save to database
            ward_id = await self.ward_repo.create(ward_doc)
            
            # Get created ward
            ward = await self.ward_repo.get_by_id(ward_id)
            
            logger.info(f"Ward created successfully: {ward_id}")
            return self._format_ward(ward)

        except CivifixException:
            raise
        except Exception as e:
            logger.error(f"Error creating ward: {str(e)}")
            raise CivifixException("Failed to create ward", status_code=500)

    async def _validate_inspector_district(
        self,
        inspector: dict,
        district_id: str,
        district: Optional[dict] = None
    ) -> None:
        """Ensure inspector belongs to the requested district"""
        inspector_district = inspector.get("district")
        if inspector_district is None:
            raise ValidationError("Inspector must belong to the same district")

        if str(inspector_district) == district_id:
            return

        if district is not None:
            district_name = str(district.get("name", ""))
            if district_name and str(inspector_district).lower() == district_name.lower():
                return

        raise ValidationError("Inspector must belong to the same district")

    async def update_ward(
        self,
        ward_id: str,
        update_data: WardUpdateSchema
    ) -> dict:
        """Update ward with validation"""
        try:
            # Check if ward exists
            ward = await self.ward_repo.get_by_id(ward_id)
            if not ward:
                raise ResourceNotFoundError("Ward not found")

            # If changing inspector, validate
            if update_data.inspector_id and self.user_repo:
                inspector = await self.user_repo.get_by_id(update_data.inspector_id)
                if not inspector:
                    raise ValidationError("Inspector not found")

                if inspector.get("role") != "INSPECTOR":
                    raise ValidationError("User is not an inspector")

                district_id = str(ward.get("district_id"))
                district = None
                if self.district_repo:
                    district = await self.district_repo.find_by_id(district_id)

                await self._validate_inspector_district(inspector, district_id, district)

            # If changing ward name, validate for duplicates
            if update_data.ward_name:
                existing = await self.ward_repo.get_by_ward_number(
                    ward.get("ward_number"),
                    str(ward.get("district_id"))
                )
                if existing and str(existing.get("_id")) != ward_id:
                    raise ValidationError("Another ward with this name already exists")

            # Prepare update data
            update_dict = {}
            if update_data.ward_name:
                update_dict["ward_name"] = update_data.ward_name
            if update_data.inspector_id:
                update_dict["inspector_id"] = ObjectId(update_data.inspector_id)
            if update_data.is_active is not None:
                update_dict["is_active"] = update_data.is_active
            if update_data.description is not None:
                update_dict["description"] = update_data.description

            # Update in database
            success = await self.ward_repo.update(ward_id, update_dict)
            
            if not success:
                raise CivifixException("Failed to update ward")

            # Get updated ward
            updated_ward = await self.ward_repo.get_by_id(ward_id)
            
            logger.info(f"Ward updated: {ward_id}")
            return self._format_ward(updated_ward)

        except CivifixException:
            raise
        except Exception as e:
            logger.error(f"Error updating ward: {str(e)}")
            raise CivifixException("Failed to update ward", status_code=500)

    async def get_ward(self, ward_id: str) -> dict:
        """Get ward details"""
        try:
            ward = await self.ward_repo.get_by_id(ward_id)
            if not ward:
                raise ResourceNotFoundError("Ward not found")
            
            return self._format_ward(ward)
        except CivifixException:
            raise
        except Exception as e:
            logger.error(f"Error getting ward: {str(e)}")
            raise CivifixException("Failed to get ward", status_code=500)

    async def list_wards(
        self,
        district_id: str,
        page: int = 1,
        limit: int = 10,
        is_active: Optional[bool] = None
    ) -> dict:
        """List wards by district with pagination"""
        try:
            skip = (page - 1) * limit
            
            wards, total = await self.ward_repo.list_by_district(
                district_id,
                skip=skip,
                limit=limit,
                is_active=is_active
            )

            formatted_wards = [self._format_ward(w) for w in wards]
            
            return {
                "data": formatted_wards,
                "total": total,
                "page": page,
                "limit": limit,
                "pages": (total + limit - 1) // limit
            }
        except Exception as e:
            logger.error(f"Error listing wards: {str(e)}")
            raise CivifixException("Failed to list wards", status_code=500)

    async def list_inspector_wards(
        self,
        inspector_id: str,
        page: int = 1,
        limit: int = 10
    ) -> dict:
        """List wards assigned to inspector"""
        try:
            skip = (page - 1) * limit
            
            wards, total = await self.ward_repo.list_by_inspector(
                inspector_id,
                skip=skip,
                limit=limit
            )

            formatted_wards = [self._format_ward(w) for w in wards]
            
            return {
                "data": formatted_wards,
                "total": total,
                "page": page,
                "limit": limit
            }
        except Exception as e:
            logger.error(f"Error listing inspector wards: {str(e)}")
            raise CivifixException("Failed to list wards", status_code=500)

    async def search_wards(
        self,
        district_id: str,
        search_query: str,
        page: int = 1,
        limit: int = 10
    ) -> dict:
        """Search wards"""
        try:
            if not search_query or len(search_query.strip()) < 1:
                raise ValidationError("Search query cannot be empty")

            skip = (page - 1) * limit
            
            wards, total = await self.ward_repo.search(
                district_id,
                search_query,
                skip=skip,
                limit=limit
            )

            formatted_wards = [self._format_ward(w) for w in wards]
            
            return {
                "data": formatted_wards,
                "total": total,
                "page": page
            }
        except CivifixException:
            raise
        except Exception as e:
            logger.error(f"Error searching wards: {str(e)}")
            raise CivifixException("Failed to search wards", status_code=500)

    async def deactivate_ward(self, ward_id: str) -> dict:
        """Deactivate ward"""
        try:
            ward = await self.ward_repo.get_by_id(ward_id)
            if not ward:
                raise ResourceNotFoundError("Ward not found")

            success = await self.ward_repo.update(ward_id, {"is_active": False})
            
            if not success:
                raise CivifixException("Failed to deactivate ward")

            updated_ward = await self.ward_repo.get_by_id(ward_id)
            
            logger.info(f"Ward deactivated: {ward_id}")
            return self._format_ward(updated_ward)
        except CivifixException:
            raise
        except Exception as e:
            logger.error(f"Error deactivating ward: {str(e)}")
            raise CivifixException("Failed to deactivate ward", status_code=500)

    def _format_ward(self, ward: dict) -> dict:
        """Format ward document for response"""
        if not ward:
            return None
        label = None
        wn = ward.get("ward_number")
        wname = ward.get("ward_name")
        if wn is not None and wname:
            label = f"{wn} - {wname}"
        elif wname:
            label = wname
        elif wn is not None:
            label = str(wn)

        return {
            "_id": str(ward.get("_id", "")),
            "district_id": str(ward.get("district_id", "")),
            "ward_name": ward.get("ward_name"),
            "ward_number": ward.get("ward_number"),
            "label": label,
            "inspector_id": str(ward.get("inspector_id", "")) if ward.get("inspector_id") else None,
            "description": ward.get("description"),
            "is_active": ward.get("is_active", True),
            "complaint_count": ward.get("complaint_count", 0),
            "active_complaints": ward.get("active_complaints", 0),
            "closed_complaints": ward.get("closed_complaints", 0),
            "created_at": ward.get("created_at"),
            "updated_at": ward.get("updated_at")
        }
