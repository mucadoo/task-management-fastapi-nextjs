from app.utils.logic import analyze_numbers


def test_basic_case():
    data = [1, 2, 3, 4, 5, "a", None]
    result = analyze_numbers(data)
    assert result == {"evenSum": 6, "oddAverage": 3.0}


def test_empty_list():
    data = []
    result = analyze_numbers(data)
    assert result == {"evenSum": 0, "oddAverage": None}


def test_all_even():
    data = [2, 4, 6]
    result = analyze_numbers(data)
    assert result == {"evenSum": 12, "oddAverage": None}


def test_all_odd():
    data = [1, 3, 5]
    result = analyze_numbers(data)
    assert result == {"evenSum": 0, "oddAverage": 3.0}


def test_ignores_strings():
    data = ["a", "b"]
    result = analyze_numbers(data)
    assert result == {"evenSum": 0, "oddAverage": None}


def test_ignores_none():
    data = [None, None]
    result = analyze_numbers(data)
    assert result == {"evenSum": 0, "oddAverage": None}


def test_ignores_booleans():
    data = [True, False, 2]
    result = analyze_numbers(data)
    assert result == {"evenSum": 2, "oddAverage": None}


def test_ignores_floats():
    data = [1.5, 2.5, 2]
    result = analyze_numbers(data)
    assert result == {"evenSum": 2, "oddAverage": None}


def test_analyze_numbers_endpoint(client):
    payload = [1, 2, 3, 4, 5, "a", None]
    response = client.post("/api/analyze-numbers", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["evenSum"] == 6
    assert data["oddAverage"] == 3.0


def test_analyze_numbers_endpoint_unauthenticated(client):
    payload = [2, 4]
    response = client.post("/api/analyze-numbers", json=payload)
    assert response.status_code == 200
    assert response.json()["evenSum"] == 6
