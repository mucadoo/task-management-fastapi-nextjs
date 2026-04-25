from typing import List, Any, Dict
def analyze_numbers(data: List[Any]) -> Dict[str, Any]:
    evens = [x for x in data if isinstance(x, int) and not isinstance(x, bool) and x % 2 == 0]
    odds = [x for x in data if isinstance(x, int) and not isinstance(x, bool) and x % 2 != 0]
    soma_pares = sum(evens)
    media_impares = sum(odds) / len(odds) if odds else None
    return {"somaPares": int(soma_pares), "mediaImpares": float(media_impares) if media_impares is not None else None}
