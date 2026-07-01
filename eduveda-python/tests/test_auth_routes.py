"""
Auth route tests — Supabase is mocked so no real DB is hit.
"""
from unittest.mock import MagicMock
from app.models.auth import hash_password


def _sb_chain(return_data):
    """Build a mock that mimics supabase.table().select().eq().maybe_single().execute()."""
    mock = MagicMock()
    mock.table.return_value.select.return_value.eq.return_value.maybe_single.return_value.execute.return_value.data = return_data
    mock.table.return_value.select.return_value.eq.return_value.execute.return_value.data = (
        [return_data] if return_data else []
    )
    mock.table.return_value.insert.return_value.execute.return_value.data = [
        {"id": "new-id", "name": "Test", "email": "new@test.com"}
    ]
    return mock


class TestLogin:
    def test_wrong_password_returns_401(self, client, mocker):
        user = {
            "id": "u1",
            "email": "admin@test.com",
            "password_hash": hash_password("correct"),
            "status": "active",
            "role": "Class Admin",
            "institute_id": "inst-1",
        }
        mocker.patch("app.routers.auth.supabase", _sb_chain(user))
        resp = client.post("/api/auth/login", json={"email": "admin@test.com", "password": "wrong"})
        assert resp.status_code == 401

    def test_inactive_account_returns_403(self, client, mocker):
        user = {
            "id": "u1",
            "email": "admin@test.com",
            "password_hash": hash_password("correct"),
            "status": "inactive",
            "role": "Class Admin",
            "institute_id": "inst-1",
        }
        mocker.patch("app.routers.auth.supabase", _sb_chain(user))
        resp = client.post("/api/auth/login", json={"email": "admin@test.com", "password": "correct"})
        assert resp.status_code == 403

    def test_valid_login_returns_token(self, client, mocker):
        user = {
            "id": "u1",
            "email": "admin@test.com",
            "password_hash": hash_password("correct"),
            "status": "active",
            "role": "Class Admin",
            "institute_id": "inst-1",
        }
        mocker.patch("app.routers.auth.supabase", _sb_chain(user))
        resp = client.post("/api/auth/login", json={"email": "admin@test.com", "password": "correct"})
        assert resp.status_code == 200
        body = resp.json()
        assert "access_token" in body
        assert body["token_type"] == "bearer"
        assert "password_hash" not in body["user"]

    def test_user_not_found_returns_401(self, client, mocker):
        mocker.patch("app.routers.auth.supabase", _sb_chain(None))
        resp = client.post("/api/auth/login", json={"email": "ghost@test.com", "password": "any"})
        assert resp.status_code == 401

    def test_login_missing_fields_returns_422(self, client):
        resp = client.post("/api/auth/login", json={"email": "only@email.com"})
        assert resp.status_code == 422


class TestRegisterInstitute:
    def test_duplicate_email_returns_400(self, client, mocker):
        sb = MagicMock()
        sb.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [{"id": "existing"}]
        mocker.patch("app.routers.auth.supabase", sb)
        resp = client.post("/api/auth/register-institute", json={
            "institute_name": "Acme School",
            "admin_name": "Admin",
            "admin_email": "taken@test.com",
            "admin_mobile": "9999999999",
            "password": "pass123",
        })
        assert resp.status_code == 400

    def test_successful_registration_returns_201(self, client, mocker):
        sb = MagicMock()
        # No existing user
        sb.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
        # Institute insert
        sb.table.return_value.insert.return_value.execute.return_value.data = [
            {"id": "inst-new", "name": "Acme School"}
        ]
        mocker.patch("app.routers.auth.supabase", sb)
        resp = client.post("/api/auth/register-institute", json={
            "institute_name": "Acme School",
            "admin_name": "Admin User",
            "admin_email": "new@test.com",
            "admin_mobile": "9999999999",
            "password": "SecurePass123",
        })
        assert resp.status_code == 201
        assert "institute_id" in resp.json()
