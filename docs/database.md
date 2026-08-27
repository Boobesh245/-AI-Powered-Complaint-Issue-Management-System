# MongoDB Database Schema Reference

Database Name: `complaint_management`

## Collections Schema

### 1. `users`
```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String (Unique Indexed)",
  "phone": "String",
  "password_hash": "String",
  "role": "super_admin | admin | staff | user",
  "department_id": "String (Optional)",
  "profile_image": "String",
  "status": "active | inactive | suspended",
  "is_verified": true,
  "created_at": "ISODate",
  "updated_at": "ISODate",
  "last_login": "ISODate"
}
```

### 2. `complaints`
```json
{
  "_id": "ObjectId",
  "complaint_number": "CMP-202608-0001 (Unique Indexed)",
  "title": "String",
  "description": "String",
  "user_id": "String (Indexed)",
  "user_name": "String",
  "user_email": "String",
  "category_id": "String",
  "category_name": "String",
  "department_id": "String",
  "department_name": "String",
  "assigned_staff_id": "String",
  "assigned_staff_name": "String",
  "priority": "low | medium | high | critical",
  "status": "submitted | under_review | assigned | in_progress | waiting_for_user | resolved | closed | reopened | rejected",
  "location": "String",
  "attachments": [],
  "ai_category": "String",
  "ai_priority": "String",
  "ai_sentiment": "positive | neutral | negative | slightly_negative",
  "ai_confidence": 0.95,
  "duplicate_score": 0.32,
  "possible_duplicate_ids": [],
  "created_at": "ISODate (Indexed)",
  "updated_at": "ISODate",
  "assigned_at": "ISODate",
  "resolved_at": "ISODate",
  "closed_at": "ISODate",
  "due_date": "ISODate",
  "sla_status": "within_sla | at_risk | breached",
  "activity_timeline": []
}
```

### 3. `departments`
```json
{
  "_id": "ObjectId",
  "name": "String (Unique)",
  "code": "String (Unique)",
  "description": "String",
  "head_id": "String",
  "status": "active",
  "created_at": "ISODate"
}
```

### 4. `categories`
```json
{
  "_id": "ObjectId",
  "name": "String (Unique)",
  "department_id": "String",
  "priority": "low | medium | high | critical",
  "description": "String",
  "status": "active",
  "created_at": "ISODate"
}
```

### 5. `staff`
```json
{
  "_id": "ObjectId",
  "user_id": "String (Unique)",
  "employee_id": "String (Unique)",
  "department_id": "String",
  "designation": "String",
  "specialization": "String",
  "availability": true,
  "current_workload": 2,
  "resolved_complaints": 14,
  "status": "active",
  "created_at": "ISODate"
}
```

### 6. `comments`
```json
{
  "_id": "ObjectId",
  "complaint_id": "String (Indexed)",
  "user_id": "String",
  "user_name": "String",
  "user_role": "String",
  "message": "String",
  "attachments": [],
  "created_at": "ISODate"
}
```

### 7. `feedback`
```json
{
  "_id": "ObjectId",
  "complaint_id": "String (Unique)",
  "user_id": "String",
  "user_name": "String",
  "rating": 5,
  "comment": "String",
  "created_at": "ISODate"
}
```

### 8. `notifications`
```json
{
  "_id": "ObjectId",
  "user_id": "String (Indexed)",
  "title": "String",
  "message": "String",
  "type": "String",
  "reference_id": "String",
  "is_read": false,
  "created_at": "ISODate"
}
```

### 9. `audit_logs`
```json
{
  "_id": "ObjectId",
  "user_id": "String (Indexed)",
  "user_email": "String",
  "action": "String",
  "entity": "String",
  "entity_id": "String",
  "old_value": "Any",
  "new_value": "Any",
  "ip_address": "String",
  "timestamp": "ISODate (Indexed)"
}
```
