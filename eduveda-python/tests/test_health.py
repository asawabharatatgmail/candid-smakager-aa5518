"""
Health-check endpoint — no Supabase interaction, always passes.
"""


def test_health_returns_ok(client):
    response = client.get("/health")
    assert response.status_code == 200


def test_health_body(client):
    data = client.get("/health").json()
    assert data["status"] == "ok"
    assert data["service"] == "EduVeda"
    assert "db" in data
    assert "ai" in data
