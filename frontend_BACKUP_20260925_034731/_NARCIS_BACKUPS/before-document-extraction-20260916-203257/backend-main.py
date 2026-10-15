from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database.database import Base, engine
from backend.database import models
from backend.api.auth import router as auth_router
from backend.api.dashboard import router as dashboard_router
from backend.api.cases import router as cases_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NARCIS Backend",
    description="Narcotics Analysis, Risk Classification and Intelligent Support System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(cases_router)


@app.get("/")
def root():
    return {
        "system": "NARCIS",
        "status": "Backend operational"
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy"
    }

