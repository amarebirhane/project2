import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.core.config import settings
from app.core.celery_app import celery_app

@celery_app.task(name="send_email_task")
def send_email_async(to_email: str, subject: str, body: str) -> bool:
    """
    Asynchronous Celery task to send an email.
    """
    if not settings.SMTP_HOST or not settings.SMTP_USER:
        print(f"SMTP not configured. SIMULATED EMAIL to {to_email}: {subject}")
        return True

    try:
        message = MIMEMultipart()
        message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
        message["To"] = to_email
        message["Subject"] = subject
        message.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_TLS:
                server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(message)
        
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

class EmailService:
    @staticmethod
    def send_email(to_email: str, subject: str, body: str) -> bool:
        """
        Sends an email asynchronously using Celery.
        """
        send_email_async.delay(to_email, subject, body)
        return True

    @staticmethod
    def send_simulated_email(to_email: str, subject: str, body: str) -> bool:
        """
        Legacy simulated email method. Now logs and returns immediately.
        """
        print(f"SIMULATED EMAIL to {to_email}: {subject}")
        return True

email_service = EmailService()
