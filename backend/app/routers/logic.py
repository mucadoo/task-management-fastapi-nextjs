from fastapi import APIRouter, Body
from typing import List, Any
from ..utils.logic import analyze_numbers

router = APIRouter()

@router.post("/analyze-numbers")
def analyze_numbers_endpoint(data: List[Any] = Body(...)):
    return analyze_numbers(data)
