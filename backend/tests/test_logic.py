import pytest
from app.utils.logic import analyze_numbers
def test_basic_case():
    data = [1, 2, 3, 4, 5, "a", None]
    result = analyze_numbers(data)
    assert result == {"somaPares": 6, "mediaImpares": 3.0}
def test_empty_list():
    data = []
    result = analyze_numbers(data)
    assert result == {"somaPares": 0, "mediaImpares": None}
def test_all_even():
    data = [2, 4, 6]
    result = analyze_numbers(data)
    assert result == {"somaPares": 12, "mediaImpares": None}
def test_all_odd():
    data = [1, 3, 5]
    result = analyze_numbers(data)
    assert result == {"somaPares": 0, "mediaImpares": 3.0}
def test_ignores_strings():
    data = ["a", "b"]
    result = analyze_numbers(data)
    assert result == {"somaPares": 0, "mediaImpares": None}
def test_ignores_none():
    data = [None, None]
    result = analyze_numbers(data)
    assert result == {"somaPares": 0, "mediaImpares": None}
def test_ignores_booleans():
    data = [True, False, 2]
    result = analyze_numbers(data)
    assert result == {"somaPares": 2, "mediaImpares": None}
def test_ignores_floats():
    data = [1.5, 2.5, 2]
    result = analyze_numbers(data)
    assert result == {"somaPares": 2, "mediaImpares": None}
