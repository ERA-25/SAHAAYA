from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel


from ai.classifier import classify_emergency


app = FastAPI()

@app.get("/emergency")
def emergency_page():
    return FileResponse("emergency_demo.html")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EmergencyRequest(BaseModel):
    description: str


@app.get("/")
def home():
    return {
        "message": "Sahaaya backend is running"
    }


@app.post("/classify")
def classify(request: EmergencyRequest):

    result = classify_emergency(request.description)

    return result
