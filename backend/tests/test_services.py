import pytest
from unittest.mock import MagicMock, patch
from app.services.email_service import EmailService
from app.services.redis_service import RedisService

class TestEmailService:
    @patch("smtplib.SMTP")
    def test_send_email_success(self, mock_smtp):
        # Setup mock
        mock_server = MagicMock()
        mock_smtp.return_value.__enter__.return_value = mock_server
        
        # Execute
        email_service = EmailService()
        result = email_service.send_email(
            to_email="test@example.com",
            subject="Test Subject",
            body="Test Body"
        )
        
        # Verify
        assert result is True
        mock_server.starttls.assert_called_once()
        mock_server.login.assert_called_once()
        mock_server.send_message.assert_called_once()

    def test_send_simulated_email(self):
        email_service = EmailService()
        result = email_service.send_simulated_email("test@example.com", "Subject", "Body")
        assert result is True

class TestRedisService:
    @patch("redis.from_url")
    def test_redis_set_get(self, mock_from_url):
        # Setup mock client
        mock_client = MagicMock()
        mock_from_url.return_value = mock_client
        mock_client.get.return_value = '"cached_value"'
        
        # Execute
        from app.core.config import settings
        with patch.object(settings, "REDIS_URL", "redis://localhost"):
            redis_service = RedisService()
            redis_service.set("test_key", "cached_value")
            result = redis_service.get("test_key")
            
        # Verify
        assert result == "cached_value"
        mock_client.set.assert_called_once()
        mock_client.get.assert_called_once_with("test_key")
