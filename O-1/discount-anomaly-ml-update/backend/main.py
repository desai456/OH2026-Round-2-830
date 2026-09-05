import sys
import os

# Ensure root directory is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from backend.config import settings
    from backend.database import engine, Base
    from backend.seed import seed_database
    from backend.routers import (
        auth, products, quotations, approvals,
        warehouses, subscriptions, portal, health, reports, ml_insights
    )
    from backend.services.ml_anomaly import ensure_model_ready
except ImportError:
    from config import settings
    from database import engine, Base
    from seed import seed_database
    from routers import (
        auth, products, quotations, approvals,
        warehouses, subscriptions, portal, health, reports, ml_insights
    )
    from services.ml_anomaly import ensure_model_ready

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for React frontend (Vite port 3000 / any local origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(products.router, prefix=settings.API_PREFIX)
app.include_router(quotations.router, prefix=settings.API_PREFIX)
app.include_router(approvals.router, prefix=settings.API_PREFIX)
app.include_router(warehouses.router, prefix=settings.API_PREFIX)
app.include_router(subscriptions.router, prefix=settings.API_PREFIX)
app.include_router(portal.router, prefix=settings.API_PREFIX)
app.include_router(health.router, prefix=settings.API_PREFIX)
app.include_router(reports.router, prefix=settings.API_PREFIX)
app.include_router(ml_insights.router, prefix=settings.API_PREFIX)

@app.on_event("startup")
def on_startup():
    print("Initializing DealFlow360 Database Schema & Seeding data...")
    Base.metadata.create_all(bind=engine)
    seed_database()

    print("Loading discount anomaly detection model (Isolation Forest + LOF)...")
    model_meta = ensure_model_ready()
    if model_meta:
        print(
            f"Discount anomaly model ready: {model_meta.get('model_version')} "
            f"trained on {model_meta.get('n_training_rows')} rows "
            f"(source={model_meta.get('data_source')})."
        )

@app.get("/")
def root():
    return {
        "status": "Online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs"
    }
