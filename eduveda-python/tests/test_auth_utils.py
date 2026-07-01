"""
Pure unit tests for password hashing and JWT helpers.
No database required — these run entirely in-process.
"""
from datetime import timedelta
import pytest
from fastapi import HTTPException

from app.models.auth import (
    hash_password,
    verify_password,
    create_access_token,
    decode_token,
)


class TestPasswordHashing:
    def test_verify_correct_password(self):
        hashed = hash_password("correct_password")
        assert verify_password("correct_password", hashed) is True

    def test_reject_wrong_password(self):
        hashed = hash_password("correct_password")
        assert verify_password("wrong_password", hashed) is False

    def test_hash_is_bcrypt(self):
        hashed = hash_password("any_password")
        assert hashed.startswith("$2b$"), "Expected bcrypt hash (starts with $2b$)"

    def test_same_password_produces_different_hashes(self):
        h1 = hash_password("same")
        h2 = hash_password("same")
        assert h1 != h2, "bcrypt must use different salts per hash"

    def test_empty_password_hashes_and_verifies(self):
        hashed = hash_password("")
        assert verify_password("", hashed) is True
        assert verify_password("notempty", hashed) is False


class TestJWT:
    def test_token_roundtrip(self):
        payload = {"sub": "user-123", "role": "Class Admin", "institute_id": "inst-456"}
        token = create_access_token(payload, expires_delta=timedelta(minutes=30))
        decoded = decode_token(token)
        assert decoded["sub"] == "user-123"
        assert decoded["role"] == "Class Admin"
        assert decoded["institute_id"] == "inst-456"

    def test_expired_token_raises_401(self):
        token = create_access_token({"sub": "u1"}, expires_delta=timedelta(seconds=-1))
        with pytest.raises(HTTPException) as exc:
            decode_token(token)
        assert exc.value.status_code == 401

    def test_tampered_token_raises_401(self):
        token = create_access_token({"sub": "u1"})
        tampered = token[:-8] + "XXXXXXXX"
        with pytest.raises(HTTPException) as exc:
            decode_token(tampered)
        assert exc.value.status_code == 401

    def test_garbage_string_raises_401(self):
        with pytest.raises(HTTPException) as exc:
            decode_token("not.a.jwt")
        assert exc.value.status_code == 401

    def test_token_payload_is_readable(self):
        """JWT payload is base64-encoded (not encrypted) — verify decode works."""
        import base64, json
        token = create_access_token({"sub": "u1", "role": "Teacher"})
        parts = token.split(".")
        padded = parts[1] + "=" * (-len(parts[1]) % 4)
        body = json.loads(base64.urlsafe_b64decode(padded))
        assert body["sub"] == "u1"
        assert body["role"] == "Teacher"
        assert "exp" in body
