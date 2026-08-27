import logging
from pymongo import MongoClient, ASCENDING, DESCENDING, TEXT
from pymongo.database import Database
from app.config import settings

logger = logging.getLogger("uvicorn.error")

client: MongoClient = None
db: Database = None

def get_database() -> Database:
    global client, db
    if db is None:
        client = MongoClient(settings.MONGODB_URI)
        db = client[settings.DATABASE_NAME]
    return db

def connect_and_init_db():
    global client, db
    try:
        client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=5000)
        # Verify connection
        client.admin.command('ping')
        db = client[settings.DATABASE_NAME]
        logger.info(f"Successfully connected to MongoDB: {settings.DATABASE_NAME}")
        init_indexes(db)
        return db
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        # Return db object anyway to allow graceful initialization
        client = MongoClient(settings.MONGODB_URI)
        db = client[settings.DATABASE_NAME]
        return db

def init_indexes(database: Database):
    try:
        # Users indexes
        database.users.create_index([("email", ASCENDING)], unique=True)
        database.users.create_index([("role", ASCENDING)])
        database.users.create_index([("status", ASCENDING)])

        # Complaints indexes
        database.complaints.create_index([("complaint_number", ASCENDING)], unique=True)
        database.complaints.create_index([("user_id", ASCENDING)])
        database.complaints.create_index([("department_id", ASCENDING)])
        database.complaints.create_index([("category_id", ASCENDING)])
        database.complaints.create_index([("assigned_staff_id", ASCENDING)])
        database.complaints.create_index([("status", ASCENDING)])
        database.complaints.create_index([("priority", ASCENDING)])
        database.complaints.create_index([("created_at", DESCENDING)])
        database.complaints.create_index([("title", TEXT), ("description", TEXT)])

        # Categories & Departments
        database.categories.create_index([("name", ASCENDING)], unique=True)
        database.departments.create_index([("name", ASCENDING)], unique=True)
        database.departments.create_index([("code", ASCENDING)], unique=True)

        # Staff
        database.staff.create_index([("user_id", ASCENDING)], unique=True)
        database.staff.create_index([("department_id", ASCENDING)])

        # Notifications
        database.notifications.create_index([("user_id", ASCENDING), ("is_read", ASCENDING)])
        database.notifications.create_index([("created_at", DESCENDING)])

        # Audit logs
        database.audit_logs.create_index([("timestamp", DESCENDING)])
        database.audit_logs.create_index([("entity", ASCENDING), ("entity_id", ASCENDING)])
        database.audit_logs.create_index([("user_id", ASCENDING)])

        logger.info("MongoDB indexes verified and ensured.")
    except Exception as e:
        logger.warning(f"Error ensuring indexes: {e}")

def close_db_connection():
    global client
    if client:
        client.close()
        logger.info("MongoDB connection closed.")
