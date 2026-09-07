from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector
from backend.matching import match_emergency_to_helpers


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Emergency request format
# -----------------------------
class Emergency(BaseModel):
    category: str
    severity: str
    required_skill: str
    description: str
    latitude: float
    longitude: float


# -----------------------------
# Home route
# -----------------------------
@app.get("/")
def home():
    return {"message": "Sahaaya backend is running!"}


# -----------------------------
# Create emergency
# -----------------------------
@app.post("/emergency")
def create_emergency(emergency: Emergency):

    # Connect to MySQL
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Era@MYSQL123",
        database="sahaaya",
        port=3306
    )

    cursor = db.cursor()

    # Save emergency in database
    query = """
        INSERT INTO emergencies
        (emergency_type, description, urgency, latitude, longitude, status)
        VALUES (%s, %s, %s, %s, %s, %s)
    """

    values = (
        emergency.category,
        emergency.description,
        emergency.severity,
        emergency.latitude,
        emergency.longitude,
        "pending"
    )

    cursor.execute(query, values)
    db.commit()

    emergency_id = cursor.lastrowid

    cursor.close()
    db.close()

    return {
        "message": "Emergency created successfully",
        "emergency_id": emergency_id,
        "status": "pending"
    }
# -----------------------------
# Find nearby helpers
# -----------------------------
@app.get("/emergency/{emergency_id}/helpers")
def get_helpers(emergency_id: int):

    helpers = match_emergency_to_helpers(emergency_id)

    return {
        "emergency_id": emergency_id,
        "status": "searching",
        "helpers": helpers
    }
# -----------------------------
# Helper accepts emergency
# -----------------------------
@app.post("/match/{emergency_id}/accept")
def accept_emergency(emergency_id: int, helper_id: int):

    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Era@MYSQL123",
        database="sahaaya",
        port=3306
    )

    cursor = db.cursor()

    # Mark emergency as accepted
    update_emergency = """
        UPDATE emergencies
        SET status = 'accepted'
        WHERE id = %s
    """

    cursor.execute(update_emergency, (emergency_id,))

    # Mark helper as unavailable
    update_helper = """
        UPDATE helpers
        SET available = 0
        WHERE id = %s
    """

    cursor.execute(update_helper, (helper_id,))

    db.commit()

    cursor.close()
    db.close()

    return {
        "emergency_id": emergency_id,
        "helper_id": helper_id,
        "status": "accepted",
        "message": "Helper accepted the emergency"
    }