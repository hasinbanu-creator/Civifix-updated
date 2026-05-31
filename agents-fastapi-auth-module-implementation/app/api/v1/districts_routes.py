"""District management API routes"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Dict, Any, List

from app.core.response import ResponseHandler
from app.core.exceptions import (
    ValidationException,
)
from app.dependencies.auth_dependency import get_current_super_admin
from app.dependencies.role_dependency import require_role
from app.services.district_service import DistrictService
from app.repositories.district_repository import DistrictRepository
from app.schemas.district_schema import (
    CreateDistrictSchema,
    UpdateDistrictSchema,
    DistrictResponseSchema
)
from app.utils.helpers import serialize_mongo_documents, serialize_mongo_document

router = APIRouter()


# =========================
# CREATE DISTRICT
# =========================

@router.post(
    "/districts",
    summary="Create a new district",
    dependencies=[Depends(require_role("SUPER_ADMIN"))]
)
async def create_district(
    payload: CreateDistrictSchema,
    current_user: Dict[str, Any] = Depends(get_current_super_admin)
):
    """
    Create a new district (SUPER_ADMIN only).
    
    - **name**: District name (unique)
    - **code**: District code (unique, 2-10 chars)
    - **state**: State name (default: Tamil Nadu)
    - **email**: District email (optional)
    - **phone**: District phone (optional)
    - **address**: District address (optional)
    """
    try:
        district_id = await DistrictService.create_district(
            name=payload.name,
            code=payload.code,
            state=payload.state,
            email=payload.email,
            phone=payload.phone,
            address=payload.address,
            created_by_id=current_user.get("user_id")
        )
        
        return ResponseHandler.success(
            message="District created successfully",
            data={"district_id": district_id},
            status_code=status.HTTP_201_CREATED
        )
    
    except ValueError as e:
        return ResponseHandler.error(
            message="Validation failed",
            errors=str(e),
            status_code=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return ResponseHandler.error(
            message="Failed to create district",
            errors=str(e),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# =========================
# GET ALL DISTRICTS
# =========================

@router.get(
    "/districts",
    summary="Get all districts"
)
async def get_districts(
    active_only: bool = Query(False, description="Only return active districts")
):
    try:
        if active_only:
            districts = await DistrictService.get_active_districts()
        else:
            districts = await DistrictService.get_all_districts()

        districts = serialize_mongo_documents(districts)

        return ResponseHandler.success(
            message="Districts retrieved",
            data=districts
        )

    except Exception as e:
        return ResponseHandler.error(
            message="Failed to retrieve districts",
            errors=str(e),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# =========================
# GET DISTRICT BY ID
# =========================

@router.get(
    "/districts/{district_id}",
    summary="Get district by ID",
    # dependencies=[Depends(require_role("SUPER_ADMIN", "DISTRICT_ADMIN"))]
)
async def get_district(
    district_id: str,
    # current_user: Dict[str, Any] = Depends(get_current_super_admin)
):
    """Get a specific district by ID"""
    try:
        district = await DistrictService.get_district(district_id)
        
        if not district:
            return ResponseHandler.error(
                message="District not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        district = serialize_mongo_document(district)
        
        return ResponseHandler.success(
            message="District retrieved",
            data=district
        )
    
    except Exception as e:
        return ResponseHandler.error(
            message="Failed to retrieve district",
            errors=str(e),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# =========================
# UPDATE DISTRICT
# =========================

@router.patch(
    "/districts/{district_id}",
    summary="Update district information",
    dependencies=[Depends(require_role("SUPER_ADMIN"))]
)
async def update_district(
    district_id: str,
    payload: UpdateDistrictSchema,
    current_user: Dict[str, Any] = Depends(get_current_super_admin)
):
    """
    Update district information (SUPER_ADMIN only).
    
    - **name**: District name (optional)
    - **email**: District email (optional)
    - **phone**: District phone (optional)
    - **address**: District address (optional)
    """
    try:
        # Check if district exists
        district = await DistrictService.get_district(district_id)
        if not district:
            return ResponseHandler.error(
                message="District not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        success = await DistrictService.update_district(
            district_id,
            name=payload.name,
            email=payload.email,
            phone=payload.phone,
            address=payload.address
        )
        
        if success:
            return ResponseHandler.success(
                message="District updated successfully"
            )
        else:
            return ResponseHandler.error(
                message="No changes made to district",
                status_code=status.HTTP_400_BAD_REQUEST
            )
    
    except ValueError as e:
        return ResponseHandler.error(
            message="Validation failed",
            errors=str(e),
            status_code=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return ResponseHandler.error(
            message="Failed to update district",
            errors=str(e),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# =========================
# ACTIVATE DISTRICT
# =========================

@router.patch(
    "/districts/{district_id}/activate",
    summary="Activate a district",
    dependencies=[Depends(require_role("SUPER_ADMIN"))]
)
async def activate_district(
    district_id: str,
    current_user: Dict[str, Any] = Depends(get_current_super_admin)
):
    """Activate a district (SUPER_ADMIN only)"""
    try:
        district = await DistrictService.get_district(district_id)
        if not district:
            return ResponseHandler.error(
                message="District not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        success = await DistrictService.activate_district(district_id)
        
        if success:
            return ResponseHandler.success(
                message="District activated successfully"
            )
        else:
            return ResponseHandler.error(
                message="Failed to activate district",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    except Exception as e:
        return ResponseHandler.error(
            message="Failed to activate district",
            errors=str(e),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# =========================
# DEACTIVATE DISTRICT
# =========================

@router.patch(
    "/districts/{district_id}/deactivate",
    summary="Deactivate a district",
    dependencies=[Depends(require_role("SUPER_ADMIN"))]
)
async def deactivate_district(
    district_id: str,
    current_user: Dict[str, Any] = Depends(get_current_super_admin)
):
    """Deactivate a district (SUPER_ADMIN only)"""
    try:
        district = await DistrictService.get_district(district_id)
        if not district:
            return ResponseHandler.error(
                message="District not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        success = await DistrictService.deactivate_district(district_id)
        
        if success:
            return ResponseHandler.success(
                message="District deactivated successfully"
            )
        else:
            return ResponseHandler.error(
                message="Failed to deactivate district",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    except Exception as e:
        return ResponseHandler.error(
            message="Failed to deactivate district",
            errors=str(e),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# =========================
# DELETE DISTRICT
# =========================

@router.delete(
    "/districts/{district_id}",
    summary="Delete a district",
    dependencies=[Depends(require_role("SUPER_ADMIN"))]
)
async def delete_district(
    district_id: str,
    current_user: Dict[str, Any] = Depends(get_current_super_admin)
):
    """Delete a district (SUPER_ADMIN only)"""
    try:
        district = await DistrictService.get_district(district_id)
        if not district:
            return ResponseHandler.error(
                message="District not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        
        success = await DistrictService.delete_district(district_id)
        
        if success:
            return ResponseHandler.success(
                message="District deleted successfully"
            )
        else:
            return ResponseHandler.error(
                message="Failed to delete district",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    except Exception as e:
        return ResponseHandler.error(
            message="Failed to delete district",
            errors=str(e),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
