"""User request/response schemas"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class RoleEnum(str, Enum):
    """Role enum"""
    SUPER_ADMIN = "SUPER_ADMIN"
    DISTRICT_ADMIN = "DISTRICT_ADMIN"
    INSPECTOR = "INSPECTOR"
    WORKER = "WORKER"
    CITIZEN = "CITIZEN"


class UserStatusEnum(str, Enum):
    """User status enum"""
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"


class CreateAdminSchema(BaseModel):
    """Create admin user schema"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    mobile_number: str = Field(..., min_length=10, max_length=10)
    role: RoleEnum = Field(..., description="Role for the user")
    district: Optional[str] = None
    address: str = Field(..., min_length=5, max_length=200)

    class Config:
        example = {
            "name": "Admin User",
            "email": "admin@gmail.com",
            "mobile_number": "9876543210",
            "role": "DISTRICT_ADMIN",
            "district": "6a156a1258884d22663b2a06",
            "address": "Chennai"
        }


class UserResponseSchema(BaseModel):
    """User response schema"""
    id: str = Field(..., alias="_id")
    name: str
    email: str
    mobile_number: str
    district: str
    role: str
    status: str
    is_verified: bool
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        populate_by_name = True
        example = {
            "_id": "507f1f77bcf86cd799439011",
            "name": "Shakthi",
            "email": "user@gmail.com",
            "mobile_number": "9876543210",
            "district": "Chennai",
            "role": "CITIZEN",
            "status": "ACTIVE",
            "is_verified": True,
            "is_active": True,
            "created_at": "2024-05-20T10:00:00",
            "last_login": "2024-05-20T10:30:00"
        }


class UpdateUserProfileSchema(BaseModel):
    """Update user profile schema"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    address: Optional[str] = Field(None, min_length=5, max_length=200)

    class Config:
        example = {
            "name": "Updated Name",
            "address": "Updated Address"
        }
