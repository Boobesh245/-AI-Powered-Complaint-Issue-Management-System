from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timezone
from app.database import get_database
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, ForgotPasswordRequest, ResetPasswordRequest
from app.utils.security import verify_password, get_password_hash, create_access_token
from app.utils.helpers import serialize_mongo
from app.middleware.auth import get_current_user
from app.services.audit_service import audit_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest):
    db = get_database()
    existing = db.users.find_one({"email": req.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    now = datetime.now(timezone.utc)
    hashed_pwd = get_password_hash(req.password)
    
    user_doc = {
        "name": req.name,
        "email": req.email.lower(),
        "password_hash": hashed_pwd,
        "phone": req.phone,
        "role": req.role if req.role in ["user", "staff", "admin", "super_admin"] else "user",
        "department_id": req.department_id,
        "profile_image": None,
        "status": "active",
        "is_verified": True,
        "created_at": now,
        "updated_at": now,
        "last_login": now
    }
    
    res = db.users.insert_one(user_doc)
    user_id = str(res.inserted_id)
    user_doc["id"] = user_id
    
    # If registered as staff, create staff record
    if req.role == "staff":
        staff_doc = {
            "user_id": user_id,
            "employee_id": f"EMP-{user_id[-4:].upper()}",
            "department_id": req.department_id or "",
            "designation": "Support Specialist",
            "specialization": "General Support",
            "availability": True,
            "current_workload": 0,
            "resolved_complaints": 0,
            "status": "active",
            "created_at": now
        }
        db.staff.insert_one(staff_doc)

    audit_service.log(
        user_id=user_id,
        user_email=req.email.lower(),
        action="USER_REGISTERED",
        entity="user",
        entity_id=user_id
    )

    access_token = create_access_token(data={"sub": user_id, "email": req.email.lower(), "role": user_doc["role"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": serialize_mongo(user_doc)
    }

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest):
    db = get_database()
    user = db.users.find_one({"email": req.email.lower()})
    if not user or not verify_password(req.password, user.get("password_hash", "")):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    if user.get("status") in ["inactive", "suspended"]:
        raise HTTPException(status_code=403, detail="Account is suspended or deactivated. Contact administrator.")

    now = datetime.now(timezone.utc)
    db.users.update_one({"_id": user["_id"]}, {"$set": {"last_login": now}})

    user_id = str(user["_id"])
    access_token = create_access_token(data={"sub": user_id, "email": user["email"], "role": user.get("role", "user")})

    audit_service.log(
        user_id=user_id,
        user_email=user["email"],
        action="USER_LOGIN",
        entity="user",
        entity_id=user_id
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": serialize_mongo(user)
    }

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {"success": True, "data": serialize_mongo(current_user)}

@router.post("/logout")
def logout(current_user: dict = Depends(get_current_user)):
    audit_service.log(
        user_id=current_user["id"],
        user_email=current_user.get("email", ""),
        action="USER_LOGOUT",
        entity="user",
        entity_id=current_user["id"]
    )
    return {"success": True, "message": "Logged out successfully"}

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    db = get_database()
    user = db.users.find_one({"email": req.email.lower()})
    # Return simulated reset token for development demonstration
    return {
        "success": True,
        "message": "Password reset token sent to email if account exists",
        "demo_token": "DEMO-RESET-KEY-2026"
    }

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest):
    db = get_database()
    user = db.users.find_one({"email": req.email.lower()})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_hash = get_password_hash(req.new_password)
    db.users.update_one({"_id": user["_id"]}, {"$set": {"password_hash": new_hash, "updated_at": datetime.now(timezone.utc)}})

    return {"success": True, "message": "Password updated successfully"}
