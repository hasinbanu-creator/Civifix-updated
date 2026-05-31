"""Complaint management routes"""
from fastapi import APIRouter, Depends, status, HTTPException, Query
from bson import ObjectId
import logging
from typing import Optional

from app.core.response import SuccessResponse
from app.dependencies.auth_dependency import get_current_user
from app.core.exceptions import CivifixException
from app.core.enums import Roles
from app.schemas.complaint_schema import (
    ComplaintCreateSchema, ComplaintAssignWorkerSchema,
    ComplaintSubmitResolutionSchema, ComplaintApproveSchema,
    ComplaintRejectSchema
)
from app.services.complaint_service import ComplaintService
from app.services.notification_service import NotificationService
from app.repositories.complaint_repository import ComplaintRepository
from app.repositories.ward_repository import WardRepository
from app.repositories.user_repository import UserRepository
from app.db.mongodb import get_database
from app.dependencies.role_dependency import require_role

logger = logging.getLogger(__name__)

router = APIRouter()


def get_complaint_service(db=Depends(get_database)):
    """Dependency for complaint service"""
    complaint_repo = ComplaintRepository(db)
    ward_repo = WardRepository(db)
    # UserRepository uses classmethods and does not require instantiation
    user_repo = UserRepository
    notification_service = NotificationService()
    return ComplaintService(complaint_repo, ward_repo, user_repo, notification_service)


@router.post(
    "",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Create Complaint",
    tags=["Complaints"]
)
async def create_complaint(
    complaint_data: ComplaintCreateSchema,
    current_user: dict = Depends(get_current_user),
    service: ComplaintService = Depends(get_complaint_service)
):
    """Create a new complaint (CITIZEN only)"""
    try:
        result = await service.create_complaint(
            complaint_data,
            current_user["user_id"],
            current_user.get("role", "CITIZEN")
        )
        return SuccessResponse.create(
            data=result,
            message="Complaint created successfully",
            status_code=status.HTTP_201_CREATED
        )
    except CivifixException as e:
        logger.error(f"Complaint creation error: {str(e)}")
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/my/dashboard",
    response_model=dict,
    summary="My Complaints",
    tags=["Complaints"]
)
async def my_complaints(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
    service: ComplaintService = Depends(get_complaint_service)
):
    """Get current user's complaints"""
    try:
        result = await service.get_user_complaints(
            current_user["user_id"],
            page=page,
            limit=limit,
            status=status
        )
        return SuccessResponse.create(
            data=result,
            message="Complaints fetched successfully"
        )
    except CivifixException as e:
        logger.error(f"Error fetching complaints: {str(e)}")
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/{complaint_id}",
    response_model=dict,
    summary="Get Complaint Details",
    tags=["Complaints"]
)
async def get_complaint(
    complaint_id: str,
    current_user: dict = Depends(get_current_user),
    service: ComplaintService = Depends(get_complaint_service)
):
    """Get complaint details with history"""
    try:
        result = await service.get_complaint(complaint_id)
        return SuccessResponse.create(
            data=result,
            message="Complaint fetched successfully"
        )
    except CivifixException as e:
        logger.error(f"Complaint fetch error: {str(e)}")
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put(
    "/{complaint_id}/assign-worker",
    response_model=dict,
    summary="Assign Worker",
    tags=["Complaints"]
)
async def assign_worker(
    complaint_id: str,
    assignment_data: ComplaintAssignWorkerSchema,
    current_user: dict = Depends(get_current_user),
    role_validated: bool = Depends(require_role(["INSPECTOR"])),
    service: ComplaintService = Depends(get_complaint_service)
):
    """Assign worker to complaint (INSPECTOR only)"""
    try:
        result = await service.assign_worker(
            complaint_id,
            assignment_data,
            current_user["user_id"],
            current_user.get("role", "INSPECTOR")
        )
        return SuccessResponse.create(
            data=result,
            message="Worker assigned successfully"
        )
    except CivifixException as e:
        logger.error(f"Worker assignment error: {str(e)}")
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put(
    "/{complaint_id}/submit-work",
    response_model=dict,
    summary="Submit Work",
    tags=["Complaints"]
)
async def submit_work(
    complaint_id: str,
    work_data: ComplaintSubmitResolutionSchema,
    current_user: dict = Depends(get_current_user),
    role_validated: bool = Depends(require_role(["WORKER"])),
    service: ComplaintService = Depends(get_complaint_service)
):
    """Submit work completion (WORKER only)"""
    try:
        result = await service.submit_work(
            complaint_id,
            work_data,
            current_user["user_id"],
            current_user.get("role", "WORKER")
        )
        return SuccessResponse.create(
            data=result,
            message="Work submitted successfully"
        )
    except CivifixException as e:
        logger.error(f"Work submission error: {str(e)}")
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put(
    "/{complaint_id}/approve",
    response_model=dict,
    summary="Approve Complaint",
    tags=["Complaints"]
)
async def approve_complaint(
    complaint_id: str,
    approve_data: ComplaintApproveSchema,
    current_user: dict = Depends(get_current_user),
    role_validated: bool = Depends(require_role(["INSPECTOR"])),
    service: ComplaintService = Depends(get_complaint_service)
):
    """Approve complaint (INSPECTOR only)"""
    try:
        result = await service.approve_complaint(
            complaint_id,
            approve_data,
            current_user["user_id"],
            current_user.get("role", "INSPECTOR")
        )
        return SuccessResponse.create(
            data=result,
            message="Complaint approved successfully"
        )
    except CivifixException as e:
        logger.error(f"Approval error: {str(e)}")
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put(
    "/{complaint_id}/reject",
    response_model=dict,
    summary="Reject Complaint",
    tags=["Complaints"]
)
async def reject_complaint(
    complaint_id: str,
    reject_data: ComplaintRejectSchema,
    current_user: dict = Depends(get_current_user),
    role_validated: bool = Depends(require_role(["INSPECTOR"])),
    service: ComplaintService = Depends(get_complaint_service)
):
    """Reject complaint and return to worker (INSPECTOR only)"""
    try:
        result = await service.reject_complaint(
            complaint_id,
            reject_data,
            current_user["user_id"],
            current_user.get("role", "INSPECTOR")
        )
        return SuccessResponse.create(
            data=result,
            message="Complaint rejected successfully"
        )
    except CivifixException as e:
        logger.error(f"Rejection error: {str(e)}")
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/ward/{ward_id}",
    response_model=dict,
    summary="Ward Complaints",
    tags=["Complaints"]
)
async def get_ward_complaints(
    ward_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
    service: ComplaintService = Depends(get_complaint_service)
):
    """Get all complaints in a ward"""
    try:
        result = await service.get_ward_complaints(
            ward_id,
            page=page,
            limit=limit,
            status=status
        )
        return SuccessResponse.create(
            data=result,
            message="Ward complaints fetched successfully"
        )
    except CivifixException as e:
        logger.error(f"Error fetching ward complaints: {str(e)}")
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/inspector/dashboard",
    response_model=dict,
    summary="Inspector Dashboard",
    tags=["Complaints"]
)
async def inspector_dashboard(
    current_user: dict = Depends(get_current_user),
    role_validated: bool = Depends(require_role(["INSPECTOR"])),
    service: ComplaintService = Depends(get_complaint_service)
):
    """Get inspector dashboard stats"""
    try:
        result = await service.get_inspector_dashboard(current_user["user_id"])
        return SuccessResponse.create(
            data=result,
            message="Dashboard stats fetched successfully"
        )
    except CivifixException as e:
        logger.error(f"Dashboard error: {str(e)}")
        raise HTTPException(status_code=e.status_code, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
