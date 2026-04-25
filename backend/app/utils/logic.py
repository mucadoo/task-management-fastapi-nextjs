from typing import List, Any, Dict
def analyze_numbers(data: List[Any]) -> Dict[str, Any]:
    even_numbers = [x for x in data if isinstance(x, int) and not isinstance(x, bool) and x % 2 == 0]
    odd_numbers = [x for x in data if isinstance(x, int) and not isinstance(x, bool) and x % 2 != 0]
    even_sum = sum(even_numbers)
    odd_average = sum(odd_numbers) / len(odd_numbers) if odd_numbers else None
    return {"evenSum": int(even_sum), "oddAverage": float(odd_average) if odd_average is not None else None}
