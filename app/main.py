from fastapi import FastAPI
from scalar_fastapi import get_scalar_api_reference
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.routers import api_router
from app.core.config import settings
from app.core.database import Base, engine
from app.core.auth_middleware import RoleAuthMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import InvalidRequestError, SQLAlchemyError
import logging
from sqlalchemy import text
from sqlalchemy.orm import configure_mappers
from app.core.database import engine
import importlib


app = FastAPI(title=settings.app_name)

# Setup logger
logger = logging.getLogger("uvicorn.error")


# Global exception handlers for SQLAlchemy errors to avoid crashing the app


@app.exception_handler(InvalidRequestError)
def invalid_request_handler(request, exc: InvalidRequestError):
    # Log full exception for debugging, but return a safe message to clients
    logger.exception("SQLAlchemy InvalidRequestError: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error (database mapping/configuration). Please contact the administrator."},
    )


@app.exception_handler(SQLAlchemyError)
def sqlalchemy_error_handler(request, exc: SQLAlchemyError):
    logger.exception("SQLAlchemy error: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error (database). Please try again later."},
    )

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
)

# AuthZ Middleware (roles & JWT)
app.add_middleware(RoleAuthMiddleware)

# Rutas API
app.include_router(api_router)

@app.get("/health")
def health():
    return {"status": "ok"}


@app.on_event("startup")
def on_startup():
    if settings.auto_create_tables:
        Base.metadata.create_all(bind=engine)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/health/diagnostics")
def health_diagnostics():
    """Run lightweight diagnostics:
    - attempt to import models package
    - force SQLAlchemy mapper configuration via `configure_mappers()`
    - open a DB connection and run `SELECT 1`
    Returns 200 if all checks pass, otherwise 500 with details.
    """
    problems: list[str] = []

    # Ensure models are imported so metadata/mappers are available
    try:
        importlib.import_module('app.models')
    except Exception as e:
        problems.append(f"models import failed: {e}")

    # Force mapper configuration to surface mapping errors early
    try:
        configure_mappers()
    except Exception as e:
        problems.append(f"mapper configuration error: {e}")

    # Test DB connectivity
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        problems.append(f"database connection/query failed: {e}")

    if problems:
        logger.error("Health diagnostics found problems: %s", problems)
        return JSONResponse(status_code=500, content={"ok": False, "problems": problems})

    return {"ok": True, "detail": "All diagnostics passed"}


@app.get("/scalar", include_in_schema=False)
async def scalar_html():
    return get_scalar_api_reference(
        # Your OpenAPI document
        openapi_url=app.openapi_url,
        # Avoid CORS issues (optional)
        scalar_proxy_url="https://proxy.scalar.com",
    )