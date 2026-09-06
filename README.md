SAHAAYA 

SAHAAYA is an emergency assistance system that helps identify the type of help required during an emergency and connects the situation with a suitable nearby responder.

Instead of making the user figure out whom to contact, SAHAAYA uses the emergency information to determine the required skill and find an appropriate responder based on skill, availability, verification and proximity.

Key Features:
* Emergency categories such as Medical, Fire, Accident, Danger and Electrical
* Custom description for other emergencies
* AI-assisted emergency classification
* Severity and required-skill identification
* Location-based responder matching
* Responder verification and availability
* Emergency status tracking
* Progressive search for nearby assistance

Technology Stack:
* Frontend: HTML, CSS, JavaScript
* Backend: Python, FastAPI
* Database: MySQL
* AI: Emergency classification
* Version Control: GitHub

Project Structure


SAHAAYA
├── frontend/
├── backend/
├── ai/
├── database/
└── README.md


Current Progress
Completed:
* Frontend emergency reporting flow
* Emergency category and sub-category selection
* Custom "Other" emergency description
* Responder registration flow
* Responder verification flow
* Responder availability toggle
* Emergency status interface
* MySQL database schema
* Demo responder data
* AI classification structure
* FastAPI emergency endpoint

In Progress:
* Connecting FastAPI with MySQL
* Responder matching API
* Responder accept/decline API
* Connecting the complete frontend-backend flow

Emergency Flow:

User reports emergency
        ↓
Emergency information collected
        ↓
AI identifies category / severity / required skill
        ↓
Backend receives emergency
        ↓
Database is searched for suitable responders
        ↓
Verified + available + skill-matched responders
        ↓
Closest suitable responder
        ↓
Responder accepts
        ↓
User receives emergency status

Responder Matching:
SAHAAYA does not simply select the closest responder.

The system considers:

1. Required skill
2. Responder verification
3. Responder availability
4. Distance from the emergency

This helps ensure that the person responding is both suitable and available.

Team

* ELSA: Backend / FastAPI
* SRUSHTI: MySQL / Database
* BHAVADA: Frontend / UI
* MEHLIKA: AI classification

Current Prototype Status:
This repository contains the current prototype and implementation progress for Review 1. Some components are still being integrated, particularly the complete backend-database-matching flow.
