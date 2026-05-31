"""Ward management routes"""
from fastapi import APIRouter, Depends, status, HTTPException
from bson import ObjectId
import logging

from app.core.response import SuccessResponse, ErrorResponse
from app.dependencies.auth_dependency import get_current_user
from app.core.exceptions import CivifixException
from app.schemas.complaint_schema import (
    WardCreateSchema, WardUpdateSchema, WardResponseSchema
)
from app.services.ward_service import WardService
from app.repositories.ward_repository import WardRepository
from app.repositories.user_repository import UserRepository
from app.repositories.district_repository import DistrictRepository
from app.db.mongodb import get_database
from app.dependencies.role_dependency import require_role

logger = logging.getLogger(__name__)

router = APIRouter()


def get_ward_service(db=Depends(get_database)):
    """Dependency for ward service"""
    ward_repo = WardRepository(db)
    district_repo = DistrictRepository
    # UserRepository uses classmethods and does not require instantiation
    user_repo = UserRepository
    return WardService(ward_repo, user_repo, district_repo)


@router.post(
    "",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Create Ward",
    tags=["Ward Management"]
)
async def create_ward(
    ward_data: WardCreateSchema,
    current_user: dict = Depends(get_current_user),
    role_validated: bool = Depends(require_role(["DISTRICT_ADMIN"])), # pyright: ignore[reportArgumentType]
    service: WardService = Depends(get_ward_service)
):
    """Create a new ward (DISTRICT_ADMIN only)"""
    try:
        result = await service.create_ward(ward_data, current_user["user_id"])
        return SuccessResponse.create(
            data=result,
            message="Ward created successfully",
            status_code=status.HTTP_201_CREATED
        )
    except CivifixException as e:
        logger.error(f"Ward creation error: {str(e)}")
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put(
    "/{ward_id}",
    response_model=dict,
    summary="Update Ward",
    tags=["Ward Management"]
)
async def update_ward(
    ward_id: str,
    ward_data: WardUpdateSchema,
    current_user: dict = Depends(get_current_user),
    role_validated: bool = Depends(require_role(["DISTRICT_ADMIN"])),
    service: WardService = Depends(get_ward_service)
):
    """Update ward details (DISTRICT_ADMIN only)"""
    try:
        result = await service.update_ward(ward_id, ward_data)
        return SuccessResponse.create(
            data=result,
            message="Ward updated successfully"
        )
    except CivifixException as e:
        logger.error(f"Ward update error: {str(e)}")
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/{ward_id}",
    response_model=dict,
    summary="Get Ward Details",
    tags=["Ward Management"]
)
async def get_ward(
    ward_id: str,
    current_user: dict = Depends(get_current_user),
    service: WardService = Depends(get_ward_service)
):
    """Get ward details"""
    try:
        result = await service.get_ward(ward_id)
        return SuccessResponse.create(
            data=result,
            message="Ward fetched successfully"
        )
    except CivifixException as e:
        logger.error(f"Ward fetch error: {str(e)}")
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/district/{district_id}",
    response_model=dict,
    summary="List Wards by District",
    tags=["Ward Management"]
)
async def list_wards(
    district_id: str,
    page: int = 1,
    limit: int = 10,
    is_active: bool = None,
    service: WardService = Depends(get_ward_service)
):
    """List wards in a district with pagination"""
    try:
        result = await service.list_wards(
            district_id,
            page=page,
            limit=limit,
            is_active=is_active
        )
        return SuccessResponse.create(
            data=result,
            message="Wards fetched successfully"
        )
    except CivifixException as e:
        logger.error(f"Ward listing error: {str(e)}")
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/inspector/{inspector_id}",
    response_model=dict,
    summary="List Inspector Wards",
    tags=["Ward Management"]
)
async def list_inspector_wards(
    inspector_id: str,
    page: int = 1,
    limit: int = 10,
    current_user: dict = Depends(get_current_user),
    service: WardService = Depends(get_ward_service)
):
    """List wards assigned to an inspector"""
    try:
        result = await service.list_inspector_wards(
            inspector_id,
            page=page,
            limit=limit
        )
        return SuccessResponse.create(
            data=result,
            message="Inspector wards fetched successfully"
        )
    except CivifixException as e:
        logger.error(f"Ward listing error: {str(e)}")
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/search/{district_id}",
    response_model=dict,
    summary="Search Wards",
    tags=["Ward Management"]
)
async def search_wards(
    district_id: str,
    q: str,
    page: int = 1,
    limit: int = 10,
    current_user: dict = Depends(get_current_user),
    service: WardService = Depends(get_ward_service)
):
    """Search wards by name or number"""
    try:
        result = await service.search_wards(
            district_id,
            q,
            page=page,
            limit=limit
        )
        return SuccessResponse.create(
            data=result,
            message="Search results fetched successfully"
        )
    except CivifixException as e:
        logger.error(f"Ward search error: {str(e)}")
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put(
    "/{ward_id}/deactivate",
    response_model=dict,
    summary="Deactivate Ward",
    tags=["Ward Management"]
)
async def deactivate_ward(
    ward_id: str,
    current_user: dict = Depends(get_current_user),
    role_validated: bool = Depends(require_role(["DISTRICT_ADMIN"])),
    service: WardService = Depends(get_ward_service)
):
    """Deactivate a ward (DISTRICT_ADMIN only)"""
    try:
        result = await service.deactivate_ward(ward_id)
        return SuccessResponse.create(
            data=result,
            message="Ward deactivated successfully"
        )
    except CivifixException as e:
        logger.error(f"Ward deactivation error: {str(e)}")
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
