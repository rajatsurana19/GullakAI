import pytest
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token

def test_password_hashing():
    pw = "sharma_diwali_2026"
    hashed = get_password_hash(pw)
    assert hashed != pw
    assert verify_password(pw, hashed) is True
    assert verify_password("wrong_password", hashed) is False

def test_jwt_token_creation_and_decode():
    merchant_id = "test-merchant-uuid-1234"
    token = create_access_token({"sub": merchant_id})
    assert isinstance(token, str)
    payload = decode_access_token(token)
    assert payload["sub"] == merchant_id
