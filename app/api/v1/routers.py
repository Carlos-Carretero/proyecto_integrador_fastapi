from fastapi import APIRouter
from .endpoints import cultivos, usuario, auth

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(cultivos.router)
api_router.include_router(usuario.router)
api_router.include_router(auth.router)