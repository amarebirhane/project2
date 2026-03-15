import logging
import time
from typing import Optional

logger = logging.getLogger("app.email")

class EmailService:
    @staticmethod
    def send_simulated_email(to_email: str, subject: str, body: str):
        """
        Simulates sending an email. In a real app, this would use an SMTP server.
        This is designed to be run as a BackgroundTask to avoid blocking the main API thread.
        """
        logger.info(f"Preparing to send email to {to_email}...")
        
        # Simulate local processing delay (e.g., rendering a template)
        time.sleep(2) 
        
        logger.info(f"EMAIL SENT SUCCESSFULLLY")
        logger.info(f"To: {to_email}")
        logger.info(f"Subject: {subject}")
        logger.info("-" * 20)

email_service = EmailService()
