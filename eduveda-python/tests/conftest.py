"""
Test configuration.

The Supabase client validates JWT key format at create_client() time, so we
must patch it at module level — before any app.* import triggers database.py.
"""
import os
from unittest.mock import MagicMock, patch

# 1. Environment variables — must come before any Settings() call
os.environ.update({
    "SUPABASE_URL": "https://test.supabase.co",
    "SUPABASE_ANON_KEY": "test-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "test-service-role-key",
    "ANTHROPIC_API_KEY": "test-anthropic-key",
    "SECRET_KEY": "super-secret-test-key-for-pytest-only-padding!!",
    "ALGORITHM": "HS256",
    "ACCESS_TOKEN_EXPIRE_MINUTES": "480",
    "APP_ENV": "test",
    "CORS_ORIGINS": "http://localhost:5173",
})

# 2. Patch supabase.create_client before database.py is imported.
#    .start() keeps the patch alive for the entire test session.
_fake_supabase = MagicMock()
patch("supabase.create_client", return_value=_fake_supabase).start()

import pytest  # noqa: E402 — after env + patch setup


@pytest.fixture(scope="session")
def app():
    from app.main import app as _app
    return _app


@pytest.fixture
def client(app):
    from fastapi.testclient import TestClient
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
