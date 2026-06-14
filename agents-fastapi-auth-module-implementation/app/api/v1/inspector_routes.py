"""Inspector API routes"""
from fastapi import APIRouter, Depends, status, HTTPException, Query
from typing import Dict, Any
from bson import ObjectId
import logging

from app.core.response import ResponseHandler
from app.dependencies.auth_dependency import get_current_user
from app.dependencies.role_dependency import require_role
from app.db.mongodb import db

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/complaints",
    summary="Get ward complaints",
    dependencies=[Depends(require_role("INSPECTOR"))]
)
async def get_ward_complaints(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str = Query(None),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get complaints for inspector's ward"""
    try:
        # Get inspector's ward
        ward = await db.wards.find_one({
            "inspector_id": ObjectId(current_user["user_id"]),
            "is_active": True
        })

        if not ward:
            return ResponseHandler.error(
                message="Inspector not assigned to any ward",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        query = {
            "ward_id": ward["_id"]
        }
        if status:
            query["status"] = status

        skip = (page - 1) * limit
        complaints = await db.complaints.find(query)\
            .skip(skip)\
            .limit(limit)\
            .to_list(length=limit)

        total = await db.complaints.count_documents(query)

        result = []
        for complaint in complaints:
            result.append({
                "_id": str(complaint["_id"]),
                "complaint_id": complaint.get("complaint_id"),
                "title": complaint.get("title"),
                "description": complaint.get("description"),
                "status": complaint.get("status"),
                "location": complaint.get("location"),
                "created_at": complaint.get("created_at").isoformat() if complaint.get("created_at") else None,
                "updated_at": complaint.get("updated_at").isoformat() if complaint.get("updated_at") else None
            })

        return ResponseHandler.success(
            message="Complaints retrieved",
            data={
                "complaints": result,
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit
            }
        )
    except Exception as e:
        logger.error(f"Error fetching ward complaints: {str(e)}")
        return ResponseHandler.error(
            message="Failed to retrieve complaints",
            errors=str(e),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@router.get(
    "/workers",
    summary="Get ward workers",
    dependencies=[Depends(require_role("INSPECTOR"))]
)
async def get_ward_workers(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Get workers assigned to inspector's ward"""
    try:
        # Get inspector's ward
        inspector = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})

        if not inspector or not inspector.get("ward_id"):
            return ResponseHandler.error(
                message="Inspector not assigned to any ward",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        workers = await db.users.find({
            "ward_id": ObjectId(inspector["ward_id"]),
            "role": "WORKER"
        }).to_list(length=1000)

        result = []
        for worker in workers:
            # Count active complaints for this worker
            active_tasks = await db.complaints.count_documents({
                "assigned_to": ObjectId(worker["_id"]),
                "status": {"$in": ["PENDING", "IN_PROGRESS"]}
            })

            result.append({
                "_id": str(worker["_id"]),
                "name": worker.get("name"),
                "email": worker.get("email"),
                "active_tasks": active_tasks,
                "status": worker.get("status", "ACTIVE")
            })

        return ResponseHandler.success(
            message="Workers retrieved",
            data=result
        )
    except Exception as e:
        logger.error(f"Error fetching ward workers: {str(e)}")
        return ResponseHandler.error(
            message="Failed to retrieve workers",
            errors=str(e),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
