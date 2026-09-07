from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector
from backend.matching import progressively_match_emergency
from backend.database import get_db_connection
from ai.classifier import classify_emergency

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
        description: str
        latitude: float
        longitude: float

class AvailabilityUpdate(BaseModel):
    available: bool
# -----------------------------
# Home route
# -----------------------------
@app.get("/")
def home():
    return {"message": "Sahaaya backend is running!"}


# -----------------------------
# Create emergency
# --------
# ---------------------
def fallback_classify_emergency(description: str):
    text = description.lower()

    # Medical
    if any(word in text for word in [
        "unconscious", "bleeding", "injured", "injury",
        "heart", "breathing", "medical", "fainted",
        "accident", "hurt"
    ]):
        return {
            "category": "medical",
            "severity": "critical",
            "required_skill": "first_aid"
        }

    # Fire
    if any(word in text for word in [
        "fire", "smoke", "burning", "flames", "flame"
    ]):
        return {
            "category": "fire",
            "severity": "critical",
            "required_skill": "fire_responder"
        }

    # Electrical
    if any(word in text for word in [
        "electric", "electricity", "electric shock",
        "wire", "wiring", "short circuit"
    ]):
        return {
            "category": "electrical",
            "severity": "high",
            "required_skill": "electrician"
        }

    # Security / danger
    if any(word in text for word in [
        "thief", "robbery", "attack", "danger",
        "security", "assault", "intruder"
    ]):
        return {
            "category": "security",
            "severity": "high",
            "required_skill": "security"
        }

    # Missing / vulnerable person
    if any(word in text for word in [
        "missing", "lost", "vulnerable", "child missing",
        "elderly missing"
    ]):
        return {
            "category": "danger",
            "severity": "high",
            "required_skill": "security"
        }

    # General fallback
    return {
        "category": "other",
        "severity": "medium",
        "required_skill": "general_help"
    }
@app.post("/emergency")
def create_emergency(emergency: Emergency):

    try:
        # First try AI classification
        ai_result = classify_emergency(emergency.description)

    except Exception as e:
        # If Gemini is unavailable/quota exceeded,
        # use the fallback classifier
        print("AI classification failed:", e)
        print("Using fallback emergency classification.")

        ai_result = fallback_classify_emergency(
            emergency.description
        )

    if not ai_result:
        ai_result = fallback_classify_emergency(
            emergency.description
        )

    category = ai_result["category"]
    severity = ai_result["severity"]
    required_skill = ai_result["required_skill"]

    # Match Person 4's AI naming with our database/matching naming
    if required_skill == "fire_response":
        required_skill = "fire_responder"

    # Connect to MySQL
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Era@MYSQL123",
        database="sahaaya",
        port=3306
    )

    cursor = db.cursor()

    query = """
        INSERT INTO emergencies
        (emergency_type, description, urgency, latitude, longitude, status, required_skill)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """

    values = (
        category,
        emergency.description,
        severity,
        emergency.latitude,
        emergency.longitude,
        "pending",
        required_skill
    )

    cursor.execute(query, values)
    db.commit()

    emergency_id = cursor.lastrowid

    cursor.close()
    db.close()

    return {
        "message": "Emergency created successfully",
        "emergency_id": emergency_id,
        "category": category,
        "severity": severity,
        "required_skill": required_skill,
        "status": "pending"
    }
# -----------------------------
# Find nearby helpers
# -----------------------------
@app.get("/emergency/{emergency_id}/helpers")
def get_helpers(emergency_id: int):

    helpers = progressively_match_emergency(emergency_id)

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

@app.get("/helper/{helper_id}")
def get_helper(helper_id: int):
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Era@MYSQL123",
        database="sahaaya",
        port=3306
    )

    cursor = db.cursor(dictionary=True)

    query = """
        SELECT
            id AS helper_id,
            name,
            phone,
            skill,
            verified,
            available,
            latitude,
            longitude
        FROM helpers
        WHERE id = %s
    """

    cursor.execute(query, (helper_id,))
    helper = cursor.fetchone()

    cursor.close()
    db.close()

    if not helper:
        return {
            "message": "Helper not found",
            "status": "error"
        }

    return helper
@app.patch("/helper/{helper_id}/availability")
def update_helper_availability(
    helper_id: int,
    update: AvailabilityUpdate
):
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Era@MYSQL123",
        database="sahaaya",
        port=3306
    )

    cursor = db.cursor()

    query = """
        UPDATE helpers
        SET available = %s
        WHERE id = %s
    """

    cursor.execute(
        query,
        (update.available, helper_id)
    )

    if cursor.rowcount == 0:
        cursor.close()
        db.close()

        return {
            "message": "Helper not found",
            "status": "error"
        }

    db.commit()

    cursor.close()
    db.close()

    return {
        "helper_id": helper_id,
        "available": update.available,
        "status": "updated",
        "message": "Helper availability updated successfully"
    }
@app.get("/helper/{helper_id}/emergencies")
def get_helper_emergencies(helper_id: int):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    query = """
        SELECT
            e.id AS emergency_id,
            e.emergency_type AS category,
            e.urgency AS severity,
            e.description,
            e.latitude,
            e.longitude,

            6371 * 2 * ASIN(
                SQRT(
                    POWER(
                        SIN(RADIANS(h.latitude - e.latitude) / 2),
                        2
                    )
                    +
                    COS(RADIANS(e.latitude))
                    * COS(RADIANS(h.latitude))
                    * POWER(
                        SIN(RADIANS(h.longitude - e.longitude) / 2),
                        2
                    )
                )
            ) AS distance_km

        FROM emergencies e
        JOIN helpers h
            ON h.id = %s

        WHERE e.status = 'pending'

        AND h.available = TRUE
        AND h.verified = TRUE

        AND e.latitude IS NOT NULL
        AND e.longitude IS NOT NULL
        AND h.latitude IS NOT NULL
        AND h.longitude IS NOT NULL

        AND (
            (
                LOWER(e.required_skill) = 'first_aid'
                AND LOWER(h.skill) IN ('first aid', 'doctor')
            )

            OR

            (
                LOWER(e.required_skill) IN ('fire_responder', 'fire_response')
                AND LOWER(h.skill) IN ('firefighter', 'fire responder')
            )

            OR

            (
                LOWER(e.required_skill) = 'electrician'
                AND LOWER(h.skill) = 'electrician'
            )

            OR

            (
                LOWER(e.required_skill) = 'security'
                AND LOWER(h.skill) = 'security'
            )
        )

        HAVING distance_km <= 1

        ORDER BY distance_km ASC
    """

    cursor.execute(query, (helper_id,))
    emergencies = cursor.fetchall()

    cursor.close()
    db.close()

    return emergencies
