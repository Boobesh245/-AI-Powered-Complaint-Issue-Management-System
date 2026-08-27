from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from bson import ObjectId
from app.database import get_database
from app.utils.helpers import (
    generate_complaint_number,
    calculate_due_date,
    evaluate_sla_status,
    serialize_mongo
)
from app.services.ai_service import ai_service
from app.services.audit_service import audit_service
from app.services.notification_service import notification_service

class ComplaintService:
    @staticmethod
    def create_complaint(
        user: dict,
        title: str,
        description: str,
        category_id: Optional[str] = None,
        department_id: Optional[str] = None,
        priority: Optional[str] = None,
        location: Optional[str] = None,
        attachments: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        db = get_database()
        now = datetime.now(timezone.utc)
        user_id = str(user["id"])

        # 1. AI Classification & Priority Prediction
        ai_res = ai_service.classify_complaint(title, description)
        
        # 2. Check for duplicate complaints
        dup_score, dup_ids = ai_service.check_duplicate_complaints(db, title, description)

        # 3. Determine Category
        category_name = "General"
        if category_id:
            cat_doc = db.categories.find_one({"_id": ObjectId(category_id)}) if ObjectId.is_valid(category_id) else db.categories.find_one({"_id": category_id})
            if cat_doc:
                category_name = cat_doc["name"]
                if not department_id and cat_doc.get("department_id"):
                    department_id = str(cat_doc["department_id"])
        else:
            # Match AI Category to database category if possible
            matched_cat = db.categories.find_one({"name": {"$regex": f"^{ai_res['ai_category']}", "$options": "i"}})
            if matched_cat:
                category_id = str(matched_cat["_id"])
                category_name = matched_cat["name"]
                if not department_id and matched_cat.get("department_id"):
                    department_id = str(matched_cat["department_id"])

        # 4. Determine Department
        department_name = "General"
        if department_id:
            dept_doc = db.departments.find_one({"_id": ObjectId(department_id)}) if ObjectId.is_valid(department_id) else db.departments.find_one({"_id": department_id})
            if dept_doc:
                department_name = dept_doc["name"]

        # 5. Determine Priority
        final_priority = (priority or ai_res["ai_priority"] or "medium").lower()

        # 6. Generate Complaint Number & SLA due date
        complaint_number = generate_complaint_number(db)
        due_date = calculate_due_date(now, final_priority)
        sla_status = evaluate_sla_status(now, due_date, "submitted")

        # 7. Intelligent Auto-Assignment Suggestion (if department has available staff)
        assigned_staff_id = None
        assigned_staff_name = None
        if department_id:
            # Find staff in this department with lowest workload
            avail_staff = list(db.staff.find(
                {"department_id": department_id, "availability": True, "status": "active"}
            ).sort("current_workload", 1).limit(1))
            if avail_staff:
                staff_user = db.users.find_one({"_id": ObjectId(avail_staff[0]["user_id"])}) if ObjectId.is_valid(avail_staff[0]["user_id"]) else db.users.find_one({"_id": avail_staff[0]["user_id"]})
                if staff_user:
                    assigned_staff_id = str(avail_staff[0]["_id"])
                    assigned_staff_name = staff_user.get("name")
                    # Increment workload
                    db.staff.update_one({"_id": avail_staff[0]["_id"]}, {"$inc": {"current_workload": 1}})

        initial_status = "assigned" if assigned_staff_id else "submitted"

        complaint_doc = {
            "complaint_number": complaint_number,
            "title": title,
            "description": description,
            "user_id": user_id,
            "user_name": user.get("name", "User"),
            "user_email": user.get("email", ""),
            "category_id": category_id,
            "category_name": category_name,
            "department_id": department_id,
            "department_name": department_name,
            "assigned_staff_id": assigned_staff_id,
            "assigned_staff_name": assigned_staff_name,
            "priority": final_priority,
            "status": initial_status,
            "location": location or "",
            "attachments": attachments or [],
            "ai_category": ai_res["ai_category"],
            "ai_priority": ai_res["ai_priority"],
            "ai_sentiment": ai_res["ai_sentiment"],
            "ai_confidence": ai_res["ai_confidence"],
            "duplicate_score": dup_score,
            "possible_duplicate_ids": dup_ids,
            "created_at": now,
            "updated_at": now,
            "assigned_at": now if assigned_staff_id else None,
            "resolved_at": None,
            "closed_at": None,
            "due_date": due_date,
            "sla_status": sla_status,
            "activity_timeline": [
                {
                    "action": "Complaint Submitted",
                    "timestamp": now,
                    "actor": user.get("name", "User"),
                    "details": f"Complaint #{complaint_number} registered with priority '{final_priority}'."
                }
            ]
        }

        if assigned_staff_id:
            complaint_doc["activity_timeline"].append({
                "action": "Staff Auto-Assigned",
                "timestamp": now,
                "actor": "System AI Engine",
                "details": f"Assigned to {assigned_staff_name} based on department specialization and availability."
            })

        insert_res = db.complaints.insert_one(complaint_doc)
        complaint_id = str(insert_res.inserted_id)
        complaint_doc["id"] = complaint_id

        # Audit Log
        audit_service.log(
            user_id=user_id,
            user_email=user.get("email", ""),
            action="CREATE_COMPLAINT",
            entity="complaint",
            entity_id=complaint_id,
            new_value={"complaint_number": complaint_number, "priority": final_priority}
        )

        # Notify User
        notification_service.create_notification(
            user_id=user_id,
            title="Complaint Submitted Successfully",
            message=f"Your complaint #{complaint_number} has been registered and is under review.",
            notif_type="complaint_created",
            reference_id=complaint_id
        )

        # Notify Admins
        notification_service.notify_admins(
            title=f"New Complaint #{complaint_number}",
            message=f"[{final_priority.upper()}] {title} submitted by {user.get('name', 'User')}",
            notif_type="complaint_created",
            reference_id=complaint_id
        )

        # Notify Staff if assigned
        if assigned_staff_id and avail_staff:
            notification_service.create_notification(
                user_id=str(avail_staff[0]["user_id"]),
                title=f"Assigned to Complaint #{complaint_number}",
                message=f"You have been assigned to handle '{title}'.",
                notif_type="complaint_assigned",
                reference_id=complaint_id
            )

        return serialize_mongo(complaint_doc)

    @staticmethod
    def update_status(complaint_id: str, new_status: str, actor: dict, comment: Optional[str] = None) -> Dict[str, Any]:
        db = get_database()
        now = datetime.now(timezone.utc)
        comp = db.complaints.find_one({"_id": ObjectId(complaint_id)}) if ObjectId.is_valid(complaint_id) else db.complaints.find_one({"_id": complaint_id})
        if not comp:
            raise ValueError("Complaint not found")

        old_status = comp.get("status")
        update_fields = {"status": new_status, "updated_at": now}

        if new_status == "resolved" and not comp.get("resolved_at"):
            update_fields["resolved_at"] = now
            # Reduce staff workload
            if comp.get("assigned_staff_id"):
                db.staff.update_one(
                    {"_id": ObjectId(comp["assigned_staff_id"]) if ObjectId.is_valid(comp["assigned_staff_id"]) else comp["assigned_staff_id"]},
                    {"$inc": {"current_workload": -1, "resolved_complaints": 1}}
                )
        elif new_status == "closed":
            update_fields["closed_at"] = now
        elif new_status == "reopened":
            update_fields["resolved_at"] = None
            update_fields["closed_at"] = None

        # Re-evaluate SLA status
        due_date = comp.get("due_date")
        resolved_at = update_fields.get("resolved_at", comp.get("resolved_at"))
        update_fields["sla_status"] = evaluate_sla_status(comp.get("created_at", now), due_date, new_status, resolved_at)

        timeline_entry = {
            "action": f"Status Changed to '{new_status.replace('_', ' ').title()}'",
            "timestamp": now,
            "actor": actor.get("name", "Admin"),
            "details": comment or f"Status updated from '{old_status}' to '{new_status}'."
        }

        db.complaints.update_one(
            {"_id": comp["_id"]},
            {
                "$set": update_fields,
                "$push": {"activity_timeline": timeline_entry}
            }
        )

        # Audit
        audit_service.log(
            user_id=str(actor.get("id")),
            user_email=actor.get("email", ""),
            action="UPDATE_STATUS",
            entity="complaint",
            entity_id=complaint_id,
            old_value=old_status,
            new_value=new_status
        )

        # Notify complaint owner
        notification_service.create_notification(
            user_id=comp["user_id"],
            title=f"Complaint #{comp['complaint_number']} Status Updated",
            message=f"Status is now '{new_status.replace('_', ' ').title()}'. {comment or ''}",
            notif_type="status_updated",
            reference_id=complaint_id
        )

        updated_doc = db.complaints.find_one({"_id": comp["_id"]})
        return serialize_mongo(updated_doc)

    @staticmethod
    def assign_staff(complaint_id: str, staff_id: str, actor: dict, comment: Optional[str] = None) -> Dict[str, Any]:
        db = get_database()
        now = datetime.now(timezone.utc)
        comp = db.complaints.find_one({"_id": ObjectId(complaint_id)}) if ObjectId.is_valid(complaint_id) else db.complaints.find_one({"_id": complaint_id})
        if not comp:
            raise ValueError("Complaint not found")

        staff_doc = db.staff.find_one({"_id": ObjectId(staff_id)}) if ObjectId.is_valid(staff_id) else db.staff.find_one({"_id": staff_id})
        if not staff_doc:
            raise ValueError("Staff member not found")

        staff_user = db.users.find_one({"_id": ObjectId(staff_doc["user_id"])}) if ObjectId.is_valid(staff_doc["user_id"]) else db.users.find_one({"_id": staff_doc["user_id"]})
        staff_name = staff_user.get("name", "Staff Member") if staff_user else "Staff Member"

        old_staff_id = comp.get("assigned_staff_id")
        if old_staff_id and old_staff_id != staff_id:
            # decrement old staff workload
            db.staff.update_one(
                {"_id": ObjectId(old_staff_id) if ObjectId.is_valid(old_staff_id) else old_staff_id},
                {"$inc": {"current_workload": -1}}
            )

        db.staff.update_one({"_id": staff_doc["_id"]}, {"$inc": {"current_workload": 1}})

        timeline_entry = {
            "action": f"Assigned to {staff_name}",
            "timestamp": now,
            "actor": actor.get("name", "Admin"),
            "details": comment or f"Staff member '{staff_name}' assigned to complaint."
        }

        new_status = "assigned" if comp["status"] == "submitted" else comp["status"]

        db.complaints.update_one(
            {"_id": comp["_id"]},
            {
                "$set": {
                    "assigned_staff_id": str(staff_doc["_id"]),
                    "assigned_staff_name": staff_name,
                    "status": new_status,
                    "assigned_at": now,
                    "updated_at": now
                },
                "$push": {"activity_timeline": timeline_entry}
            }
        )

        # Audit
        audit_service.log(
            user_id=str(actor.get("id")),
            user_email=actor.get("email", ""),
            action="ASSIGN_STAFF",
            entity="complaint",
            entity_id=complaint_id,
            old_value=old_staff_id,
            new_value=str(staff_doc["_id"])
        )

        # Notify Staff
        notification_service.create_notification(
            user_id=str(staff_doc["user_id"]),
            title=f"New Assignment: Complaint #{comp['complaint_number']}",
            message=f"You have been assigned complaint: '{comp['title']}'.",
            notif_type="complaint_assigned",
            reference_id=complaint_id
        )

        # Notify User
        notification_service.create_notification(
            user_id=comp["user_id"],
            title=f"Staff Assigned to #{comp['complaint_number']}",
            message=f"{staff_name} has been assigned to investigate your complaint.",
            notif_type="complaint_assigned",
            reference_id=complaint_id
        )

        updated_doc = db.complaints.find_one({"_id": comp["_id"]})
        return serialize_mongo(updated_doc)

complaint_service = ComplaintService()
