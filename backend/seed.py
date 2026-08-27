import random
from datetime import datetime, timedelta, timezone
from pymongo import MongoClient
from app.config import settings
from app.utils.security import get_password_hash
from app.utils.helpers import calculate_due_date, evaluate_sla_status

def seed_database():
    client = MongoClient(settings.MONGODB_URI)
    db = client[settings.DATABASE_NAME]

    print("Cleaning existing database collections...")
    db.users.delete_many({})
    db.departments.delete_many({})
    db.categories.delete_many({})
    db.staff.delete_many({})
    db.complaints.delete_many({})
    db.comments.delete_many({})
    db.feedback.delete_many({})
    db.notifications.delete_many({})
    db.audit_logs.delete_many({})
    db.system_settings.delete_many({})

    now = datetime.now(timezone.utc)
    hashed_pwd = get_password_hash("Admin@123")
    user_pwd = get_password_hash("User@123")
    staff_pwd = get_password_hash("Staff@123")

    # 1. Create Departments (6 Departments)
    print("Seeding Departments...")
    departments_data = [
        {"name": "Computer Science & IT", "code": "CS-IT", "description": "Information Technology, Lab Facilities, WiFi and Software Systems"},
        {"name": "Mechanical Engineering", "code": "MECH", "description": "Mechanical workshops, machinery, heavy equipment and lab maintenance"},
        {"name": "Civil & Infrastructure", "code": "CIVIL", "description": "Campus buildings, classrooms, water supply, sanitation and electrical fittings"},
        {"name": "Electrical & Electronics", "code": "EEE", "description": "Power grid, transformers, smart classrooms and electronic equipment"},
        {"name": "Campus Administration", "code": "ADMIN", "description": "Student affairs, accounts, fee transactions, certificates and admissions"},
        {"name": "Hostel & Transport Services", "code": "HTS", "description": "Student hostels, residential amenities, mess, cafeteria and bus logistics"}
    ]

    dept_ids = []
    for d in departments_data:
        d["status"] = "active"
        d["created_at"] = now - timedelta(days=60)
        d["updated_at"] = now - timedelta(days=60)
        res = db.departments.insert_one(d)
        dept_ids.append((str(res.inserted_id), d["name"]))

    # 2. Create Categories (10 Categories)
    print("Seeding Categories...")
    categories_data = [
        {"name": "IT Support", "department_idx": 0, "priority": "high", "description": "Internet, Wi-Fi, LMS Portal, Computers and Network Access"},
        {"name": "Infrastructure", "department_idx": 2, "priority": "medium", "description": "Classroom furniture, AC, lighting, doors and fans"},
        {"name": "Hostel Amenities", "department_idx": 5, "priority": "high", "description": "Hostel rooms, hot water, plumbing, cleanliness and warden assistance"},
        {"name": "Transport & Bus", "department_idx": 5, "priority": "medium", "description": "College bus timings, routes, pass issuance and transport tracking"},
        {"name": "Academic & Exams", "department_idx": 0, "priority": "critical", "description": "Grades, attendance records, exam schedules and faculties"},
        {"name": "Fees & Accounts", "department_idx": 4, "priority": "high", "description": "Tuition fees, receipts, online transaction issues and fines"},
        {"name": "Library Services", "department_idx": 4, "priority": "low", "description": "Book borrowing, digital journal access and study rooms"},
        {"name": "Campus Security", "department_idx": 4, "priority": "critical", "description": "Security gates, vehicle parking, CCTV cameras and lost property"},
        {"name": "Canteen & Food", "department_idx": 5, "priority": "medium", "description": "Canteen food quality, mess hygiene and pricing"},
        {"name": "Administrative Docs", "department_idx": 4, "priority": "medium", "description": "ID cards, bona-fide certificates, hall tickets and clearance"}
    ]

    cat_ids = []
    for c in categories_data:
        dept_id = dept_ids[c["department_idx"]][0]
        c_doc = {
            "name": c["name"],
            "department_id": dept_id,
            "priority": c["priority"],
            "description": c["description"],
            "status": "active",
            "created_at": now - timedelta(days=60),
            "updated_at": now - timedelta(days=60)
        }
        res = db.categories.insert_one(c_doc)
        cat_ids.append((str(res.inserted_id), c["name"], dept_id, dept_ids[c["department_idx"]][1]))

    # 3. Create Super Admin & Admins
    print("Seeding Administrators...")
    admin_users = [
        {"name": "Chief Administrator", "email": "admin@example.com", "role": "super_admin", "phone": "9876543210"},
        {"name": "Alex Mercer (Operations Admin)", "email": "admin.alex@example.com", "role": "admin", "phone": "9876543211"},
        {"name": "Sarah Connor (Support Admin)", "email": "admin.sarah@example.com", "role": "admin", "phone": "9876543212"}
    ]
    for u in admin_users:
        u_doc = {
            "name": u["name"],
            "email": u["email"],
            "password_hash": hashed_pwd,
            "phone": u["phone"],
            "role": u["role"],
            "status": "active",
            "is_verified": True,
            "department_id": dept_ids[4][0],
            "created_at": now - timedelta(days=90),
            "updated_at": now,
            "last_login": now
        }
        db.users.insert_one(u_doc)

    # 4. Create 10 Staff Members
    print("Seeding 10 Staff Members...")
    staff_specs = [
        ("David Miller", "david.staff@example.com", 0, "Senior Network Engineer", "Wi-Fi & Server Networks"),
        ("Rachel Green", "rachel.staff@example.com", 0, "Systems Administrator", "Portal & Software Bugs"),
        ("Marcus Vance", "marcus.staff@example.com", 1, "Mechanical Lab Specialist", "Equipment & Tool Repair"),
        ("Elena Rostova", "elena.staff@example.com", 2, "Civil Maintenance Head", "Electrical & Water Infrastructure"),
        ("Carlos Ray", "carlos.staff@example.com", 2, "Facilities Manager", "Classroom & Building Amenities"),
        ("Sophia Chang", "sophia.staff@example.com", 3, "Power Systems Technician", "Grid & Transformer Maintenance"),
        ("Arthur Pendelton", "arthur.staff@example.com", 4, "Accounts Officer", "Fees & Billing Inquiries"),
        ("Grace Hopper", "grace.staff@example.com", 4, "Administrative Liaison", "Student Documentation & Verification"),
        ("Vikram Singh", "vikram.staff@example.com", 5, "Hostel Resident Warden", "Hostel Facilities & Discipline"),
        ("Priya Sharma", "priya.staff@example.com", 5, "Logistics & Transport Manager", "Bus Routes & Vehicle Fleet")
    ]

    staff_records = []
    for idx, (name, email, d_idx, desig, spec) in enumerate(staff_specs):
        d_id, d_name = dept_ids[d_idx]
        user_doc = {
            "name": name,
            "email": email,
            "password_hash": staff_pwd,
            "phone": f"98765433{idx:02d}",
            "role": "staff",
            "department_id": d_id,
            "status": "active",
            "is_verified": True,
            "created_at": now - timedelta(days=80),
            "updated_at": now,
            "last_login": now - timedelta(hours=random.randint(1, 24))
        }
        u_res = db.users.insert_one(user_doc)
        u_id = str(u_res.inserted_id)

        staff_doc = {
            "user_id": u_id,
            "employee_id": f"EMP-STF{idx+1:03d}",
            "department_id": d_id,
            "designation": desig,
            "specialization": spec,
            "availability": True,
            "current_workload": 0,
            "resolved_complaints": 0,
            "status": "active",
            "created_at": now - timedelta(days=80)
        }
        s_res = db.staff.insert_one(staff_doc)
        staff_records.append((str(s_res.inserted_id), u_id, name, d_id, d_name))

    # 5. Create 50 Regular Users
    print("Seeding 50 Users...")
    first_names = ["James", "Emma", "Oliver", "Ava", "Lucas", "Mia", "Noah", "Sophia", "Liam", "Isabella",
                   "Mason", "Amelia", "Ethan", "Harper", "Alexander", "Evelyn", "Daniel", "Abigail", "Henry", "Emily",
                   "Michael", "Ella", "Jackson", "Aria", "Sebastian", "Scarlett", "Jack", "Chloe", "Owen", "Penelope",
                   "Samuel", "Layla", "Matthew", "Mila", "Joseph", "Nora", "Levi", "Hazel", "David", "Grace",
                   "John", "Zoey", "Wyatt", "Riley", "Carter", "Victoria", "Julian", "Lily", "Luke", "Hannah"]

    user_records = []
    for i, fname in enumerate(first_names):
        lname = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"][i % 10]
        email = f"{fname.lower()}.{lname.lower()}{i+1}@example.com"
        u_doc = {
            "name": f"{fname} {lname}",
            "email": email,
            "password_hash": user_pwd,
            "phone": f"987654{i:04d}",
            "role": "user",
            "department_id": dept_ids[i % len(dept_ids)][0],
            "status": "active",
            "is_verified": True,
            "created_at": now - timedelta(days=random.randint(10, 90)),
            "updated_at": now,
            "last_login": now - timedelta(hours=random.randint(1, 100))
        }
        res = db.users.insert_one(u_doc)
        user_records.append((str(res.inserted_id), f"{fname} {lname}", email))

    # 6. Create 100 Realistic Complaints
    print("Seeding 100 Realistic Complaints...")
    complaint_templates = [
        # IT Support
        ("Campus Wi-Fi not working in Academic Block B 3rd Floor", "The high-speed Wi-Fi router in Block B room 302 has been blinking red and disconnecting repeatedly during online lab sessions.", 0, "critical"),
        ("Unable to submit semester assignment on Student Portal", "When attempting to upload PDF assignment for CS301, the portal throws server error 500 continuously.", 0, "high"),
        ("Computer Lab 4 Desktop #14 blue screen crash", "The terminal monitor stays blank and crashes when compiling graphics algorithms. Needs OS restoration.", 0, "medium"),
        ("Password reset link not received on college email", "Requested password recovery 4 times today but the automated email OTP never arrives in inbox or spam.", 0, "low"),
        ("Smart projector HDMI port broken in Seminar Hall 1", "The projector is unable to receive video feed from laptops. The HDMI cable socket is physically damaged.", 0, "high"),

        # Infrastructure
        ("Air Conditioner leaking water in Room 204", "The split AC unit is dripping dirty water right over student desks causing slipping hazard.", 1, "high"),
        ("Ceiling fan making severe screeching noise in Hall A", "The second ceiling fan vibrates heavily and might fall down. Needs immediate technician inspection.", 1, "critical"),
        ("Restroom water tap broken on 2nd floor Civil building", "Water is continuously overflowing from the sink tap wasting gallons of clean water.", 1, "medium"),
        ("Broken desk chairs in Lecture Theatre 3", "Several wooden chairs have loose screws and sharp edges causing clothes to tear.", 1, "low"),
        ("Main corridor tube lights flickering constantly", "The entire hallway outside faculty cabins is dark and flickering causing eye strain.", 1, "low"),

        # Hostel
        ("Hot water geyser not functioning in Hostel Block C", "For the last 3 days the geyser on the 2nd floor is completely cold in freezing morning temperatures.", 2, "high"),
        ("Hostel room 312 door lock jammed", "The key cylinder is stuck and students are locked out of their room since this morning.", 2, "critical"),
        ("Water purifier filter alarm beeping in Hostel Mess", "The drinking water dispenser water filter indicator is red and water tastes salty.", 2, "high"),
        ("Hostel laundry room washing machine #2 vibration issue", "The machine stops midway during spin cycle and shakes violently.", 2, "medium"),
        ("Bathroom cleaning not done for 2 consecutive days in Block A", "The common restrooms on ground floor require urgent housekeeping sanitation.", 2, "medium"),

        # Transport
        ("College Bus Route 14 delayed by 45 minutes daily", "Bus #14 consistently arrives late at Central Gate stop causing students to miss first hour attendance.", 3, "medium"),
        ("Bus #7 emergency exit door lock vibrating loose", "The rear safety handle is loose and makes rattling noise throughout transit.", 3, "high"),
        ("Transport pass QR code not scanning at turnstile gate", "The physical student ID bus sticker QR code fails optical scan at college bus terminus.", 3, "low"),
        ("AC bus cooling malfunctioning during afternoon route #22", "Temperatures inside bus exceeded 35 degrees due to failed compressor blower.", 3, "medium"),
        ("Request for additional morning pickup stop at Metro Station", "Over 25 students board near Metro Pillar 124 where no authorized shelter exists.", 3, "low"),

        # Academic
        ("Discrepancy in Mid-Term Marks in Digital Electronics", "The internal assessment marks recorded on ERP portal show 14/30 whereas graded physical script shows 24/30.", 4, "critical"),
        ("Attendance shortage warning email sent incorrectly", "I was marked absent for 3 lab sessions where I physically signed the manual laboratory register.", 4, "high"),
        ("Timetable clash between Elective Cloud Computing and AI Lab", "Both elective classes are scheduled on Thursday 2:00 PM to 4:00 PM simultaneously.", 4, "critical"),
        ("Request for Supplementary Exam syllabus clarification", "Module 4 topics listed in notice board differ from official department curriculum PDF.", 4, "medium"),
        ("Delay in issuing provisional degree certificate", "Graduation transcript application submitted 3 weeks ago but still pending verification.", 4, "high"),

        # Fees
        ("Double payment deduction for Semester 6 Tuition Fee", "Bank account debited twice ($1,250 x 2) for single fee transaction ID #TXN-99812.", 5, "critical"),
        ("Fee receipt not generated after successful UPI transaction", "Amount deducted from bank but student fee portal status still shows 'Pending'.", 5, "high"),
        ("Scholarship fee concession adjustment pending on invoice", "Approved merit scholarship waiver of 25% has not been reflected in final semester dues.", 5, "medium"),
        ("Fine charged incorrectly for late library return", "Book was returned on the due date before 5 PM at counter #2 but fine is still assessed.", 5, "low"),
        ("Bank challan verification pending in Accounts office", "Submitted counterfoil copy on Monday but portal shows unverified status.", 5, "medium"),

        # Security
        ("Unauthorized stranger seen wandering near Girls Hostel boundary", "Security guards were not at post 4 between 9:00 PM and 10:00 PM.", 7, "critical"),
        ("Bicycle stolen from Student Parking Lot Area B", "Geared bicycle locked at rack 4 went missing between 10 AM and 4 PM. Requesting CCTV review.", 7, "critical"),
        ("CCTV Camera #12 blind spot near Science block back gate", "The camera angle is tilted toward the tree canopy leaving the walkway completely unmonitored.", 7, "high"),
        ("Vehicle parking gate barrier stuck in open position", "Automatic RFID boom barrier is open allowing non-college vehicles to enter freely.", 7, "medium"),
        ("Lost student wallet containing ID and debit card near Canteen", "Brown leather wallet lost during lunch break. Please notify if deposited in Lost & Found.", 7, "low"),

        # Food & Canteen
        ("Unhygienic food handling observed in central cafeteria", "Cooks serving fried items without food gloves or hairnets in main mess counter.", 8, "high"),
        ("Mess drinking water cooler dispenser leaking and dirty", "Stagnant water collecting near the water tap causing foul odor and mosquito breeding.", 8, "high"),
        ("Overcharging for standard packaged snacks above MRP", "Canteen vendor charging $0.50 above manufacturer printed MRP on bottled juice.", 8, "low"),
        ("Food quality deteriorated in Dinner Mess Menu", "Rice and lentils served half-cooked on Tuesday evening causing stomach complaints.", 8, "medium"),
        ("Need for healthier fruit and salad options in morning breakfast", "Current menu is exclusively deep-fried food. Requesting fruit stall addition.", 8, "low")
    ]

    statuses = ["submitted", "under_review", "assigned", "in_progress", "waiting_for_user", "resolved", "closed", "reopened"]
    priorities = ["low", "medium", "high", "critical"]

    for i in range(1, 101):
        tmpl_idx = (i - 1) % len(complaint_templates)
        title_base, desc_base, cat_idx, base_priority = complaint_templates[tmpl_idx]
        cat_id, cat_name, dept_id, dept_name = cat_ids[cat_idx]

        user = random.choice(user_records)
        created_days_ago = random.randint(1, 45)
        c_time = now - timedelta(days=created_days_ago, hours=random.randint(1, 20), minutes=random.randint(1, 55))

        # Determine status distribution
        if created_days_ago > 20:
            status = random.choices(["resolved", "closed", "reopened"], weights=[60, 35, 5])[0]
        elif created_days_ago > 7:
            status = random.choices(["in_progress", "resolved", "waiting_for_user", "assigned"], weights=[40, 35, 15, 10])[0]
        else:
            status = random.choices(["submitted", "under_review", "assigned", "in_progress"], weights=[30, 25, 25, 20])[0]

        priority = base_priority if random.random() < 0.8 else random.choice(priorities)
        complaint_num = f"CMP-{c_time.strftime('%Y%m')}-{i:04d}"

        # Assign staff from matching department
        dept_staff = [s for s in staff_records if s[3] == dept_id]
        if not dept_staff:
            dept_staff = staff_records
        chosen_staff = random.choice(dept_staff)

        assigned_staff_id = None
        assigned_staff_name = None
        assigned_at = None
        resolved_at = None
        closed_at = None

        if status not in ["submitted"]:
            assigned_staff_id = chosen_staff[0]
            assigned_staff_name = chosen_staff[2]
            assigned_at = c_time + timedelta(hours=random.randint(1, 6))

        due_date = calculate_due_date(c_time, priority)

        if status in ["resolved", "closed"]:
            resolved_hours = random.randint(4, 70)
            resolved_at = c_time + timedelta(hours=resolved_hours)
            if status == "closed":
                closed_at = resolved_at + timedelta(days=random.randint(1, 3))

        sla_status = evaluate_sla_status(c_time, due_date, status, resolved_at)

        # Build realistic timeline
        timeline = [
            {
                "action": "Complaint Submitted",
                "timestamp": c_time,
                "actor": user[1],
                "details": f"Registered complaint #{complaint_num} with priority '{priority}'."
            }
        ]

        if assigned_staff_id:
            timeline.append({
                "action": f"Assigned to {assigned_staff_name}",
                "timestamp": assigned_at,
                "actor": "Admin",
                "details": f"Allocated to department specialist {assigned_staff_name}."
            })

        if status in ["in_progress", "resolved", "closed"]:
            timeline.append({
                "action": "Investigation In Progress",
                "timestamp": c_time + timedelta(hours=random.randint(8, 18)),
                "actor": assigned_staff_name or "Staff",
                "details": "Technician dispatched to inspect site and troubleshoot."
            })

        if resolved_at:
            timeline.append({
                "action": "Complaint Resolved",
                "timestamp": resolved_at,
                "actor": assigned_staff_name or "Staff",
                "details": "Issue inspected, repaired, tested and confirmed working."
            })

        if closed_at:
            timeline.append({
                "action": "Complaint Closed",
                "timestamp": closed_at,
                "actor": "Admin",
                "details": "Resolution accepted and complaint archived."
            })

        complaint_doc = {
            "complaint_number": complaint_num,
            "title": f"{title_base} (#{i})",
            "description": f"{desc_base} (Reported in Area {random.choice(['North Wing', 'South Wing', 'Central Quad', 'Block C', 'Lab Complex'])})",
            "user_id": user[0],
            "user_name": user[1],
            "user_email": user[2],
            "category_id": cat_id,
            "category_name": cat_name,
            "department_id": dept_id,
            "department_name": dept_name,
            "assigned_staff_id": assigned_staff_id,
            "assigned_staff_name": assigned_staff_name,
            "priority": priority,
            "status": status,
            "location": f"Building {random.randint(1, 5)}, Room {random.randint(101, 420)}",
            "attachments": [
                {
                    "filename": f"photo_evidence_{i}.jpg",
                    "file_path": "/uploads/sample_evidence.jpg",
                    "file_type": "image/jpeg",
                    "file_size": 245000,
                    "uploaded_at": c_time.isoformat()
                }
            ] if i % 3 == 0 else [],
            "ai_category": cat_name,
            "ai_priority": priority,
            "ai_sentiment": "negative" if priority in ["critical", "high"] else "neutral",
            "ai_confidence": round(random.uniform(0.82, 0.98), 2),
            "duplicate_score": round(random.uniform(0.1, 0.4), 2),
            "possible_duplicate_ids": [],
            "created_at": c_time,
            "updated_at": now - timedelta(hours=random.randint(1, 12)),
            "assigned_at": assigned_at,
            "resolved_at": resolved_at,
            "closed_at": closed_at,
            "due_date": due_date,
            "sla_status": sla_status,
            "activity_timeline": timeline
        }

        c_insert = db.complaints.insert_one(complaint_doc)
        c_id = str(c_insert.inserted_id)

        # 7. Add sample comments
        if status in ["in_progress", "resolved", "closed", "waiting_for_user"]:
            db.comments.insert_one({
                "complaint_id": c_id,
                "user_id": user[0],
                "user_name": user[1],
                "user_role": "user",
                "message": "Is there any update on when this will be repaired? It is urgently required for our class.",
                "attachments": [],
                "created_at": c_time + timedelta(hours=4),
                "updated_at": c_time + timedelta(hours=4)
            })
            if assigned_staff_id:
                db.comments.insert_one({
                    "complaint_id": c_id,
                    "user_id": chosen_staff[1],
                    "user_name": chosen_staff[2],
                    "user_role": "staff",
                    "message": "Hello, our technical team has already ordered the replacement components. Expected completion by tomorrow.",
                    "attachments": [],
                    "created_at": c_time + timedelta(hours=8),
                    "updated_at": c_time + timedelta(hours=8)
                })

        # 8. Add feedback for resolved/closed complaints
        if status in ["resolved", "closed"] and i % 2 == 0:
            rating = random.choices([5, 4, 3, 2, 1], weights=[50, 30, 10, 5, 5])[0]
            fb_comment = "Prompt resolution by staff. Very satisfied!" if rating >= 4 else "Took longer than expected but resolved."
            db.feedback.insert_one({
                "complaint_id": c_id,
                "user_id": user[0],
                "user_name": user[1],
                "rating": rating,
                "comment": fb_comment,
                "created_at": resolved_at or now
            })
            db.complaints.update_one(
                {"_id": c_insert.inserted_id},
                {"$set": {"feedback": {"rating": rating, "comment": fb_comment, "created_at": resolved_at or now}}}
            )

        # 9. Create notifications
        if i <= 20:
            db.notifications.insert_one({
                "user_id": user[0],
                "title": f"Status Updated: #{complaint_num}",
                "message": f"Your complaint is currently '{status.replace('_', ' ').title()}'.",
                "type": "status_updated",
                "reference_id": c_id,
                "is_read": i % 2 == 0,
                "created_at": c_time + timedelta(hours=6)
            })

    # Update staff workload counters accurately from seeded complaints
    for s_id, u_id, name, d_id, d_name in staff_records:
        assigned_c = db.complaints.count_documents({"assigned_staff_id": s_id})
        resolved_c = db.complaints.count_documents({"assigned_staff_id": s_id, "status": {"$in": ["resolved", "closed"]}})
        db.staff.update_one(
            {"_id": s_id},
            {"$set": {
                "current_workload": max(0, assigned_c - resolved_c),
                "resolved_complaints": resolved_c
            }}
        )

    # 10. Create System Settings
    print("Seeding System Settings...")
    db.system_settings.update_one(
        {"key": "main_config"},
        {"$set": {
            "key": "main_config",
            "app_name": "AI-Powered Complaint & Issue Management System",
            "default_priority": "medium",
            "default_status": "submitted",
            "max_file_size_mb": 10,
            "allowed_file_types": ["jpg", "jpeg", "png", "pdf", "doc", "docx"],
            "enable_ai_classification": True,
            "ai_duplicate_threshold": 0.75,
            "email_notifications_enabled": False,
            "maintenance_mode": False,
            "sla_critical_hours": 24,
            "sla_high_hours": 48,
            "sla_medium_hours": 72,
            "sla_low_hours": 120,
            "updated_at": now
        }},
        upsert=True
    )

    print("\nDatabase Seeding Completed Successfully!")
    print(f"Total Users: {db.users.count_documents({})}")
    print(f"Total Staff: {db.staff.count_documents({})}")
    print(f"Total Departments: {db.departments.count_documents({})}")
    print(f"Total Categories: {db.categories.count_documents({})}")
    print(f"Total Complaints: {db.complaints.count_documents({})}")
    print(f"Total Feedback: {db.feedback.count_documents({})}")
    print("\nDefault Admin Account: admin@example.com / Admin@123")

if __name__ == "__main__":
    seed_database()
