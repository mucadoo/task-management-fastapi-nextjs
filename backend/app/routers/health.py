from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
@router.get("/v1/health")  
async def health_check():
    return {"status": "ok", "version": "1.0.0"}
