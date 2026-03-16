import boto3
import logging
import os
import pathlib
from botocore.exceptions import ClientError
from typing import Optional
from app.core.config import settings

logger = logging.getLogger("app.storage")

# Local fallback: files are served from /static/uploads/
LOCAL_UPLOAD_DIR = pathlib.Path(__file__).parent.parent / "static" / "uploads"


class StorageService:
    def __init__(self):
        self.s3_client = None
        if all([settings.S3_ENDPOINT_URL, settings.S3_ACCESS_KEY, settings.S3_SECRET_KEY]):
            try:
                self.s3_client = boto3.client(
                    "s3",
                    endpoint_url=settings.S3_ENDPOINT_URL,
                    aws_access_key_id=settings.S3_ACCESS_KEY,
                    aws_secret_access_key=settings.S3_SECRET_KEY,
                    region_name="us-east-1",
                )
                self._ensure_bucket()
            except Exception as e:
                logger.error(f"Failed to initialize S3 client: {e}")
        else:
            logger.info("S3 not configured – using local disk storage for uploads.")
            LOCAL_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    def _ensure_bucket(self):
        try:
            self.s3_client.head_bucket(Bucket=settings.S3_BUCKET)
        except ClientError:
            try:
                self.s3_client.create_bucket(Bucket=settings.S3_BUCKET)
                logger.info(f"Created bucket: {settings.S3_BUCKET}")
            except Exception as e:
                logger.error(f"Failed to create bucket: {e}")

    def upload_file(self, file_content: bytes, object_name: str, content_type: str) -> bool:
        """Upload a file. Uses S3 if configured, otherwise saves to local disk."""
        if self.s3_client:
            try:
                self.s3_client.put_object(
                    Bucket=settings.S3_BUCKET,
                    Key=object_name,
                    Body=file_content,
                    ContentType=content_type,
                )
                return True
            except ClientError as e:
                logger.error(f"S3 upload error: {e}")
                return False
        else:
            # Local fallback
            try:
                dest = LOCAL_UPLOAD_DIR / object_name
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_bytes(file_content)
                logger.info(f"Saved file locally: {dest}")
                return True
            except Exception as e:
                logger.error(f"Local upload error: {e}")
                return False

    def get_presigned_url(self, object_name: str, expiration: int = 3600) -> Optional[str]:
        """Return a URL to access the file. Uses signed S3 URL or local static URL."""
        if self.s3_client:
            try:
                return self.s3_client.generate_presigned_url(
                    "get_object",
                    Params={"Bucket": settings.S3_BUCKET, "Key": object_name},
                    ExpiresIn=expiration,
                )
            except ClientError as e:
                logger.error(f"Failed to generate presigned URL: {e}")
                return None
        else:
            # Return a local static URL that FastAPI serves
            base_url = getattr(settings, "BASE_URL", "http://localhost:8000")
            return f"{base_url}/static/uploads/{object_name}"

    def delete_file(self, object_name: str) -> bool:
        """Delete a file from S3 or local disk."""
        if self.s3_client:
            try:
                self.s3_client.delete_object(Bucket=settings.S3_BUCKET, Key=object_name)
                return True
            except ClientError as e:
                logger.error(f"S3 delete error: {e}")
                return False
        else:
            try:
                dest = LOCAL_UPLOAD_DIR / object_name
                if dest.exists():
                    dest.unlink()
                return True
            except Exception as e:
                logger.error(f"Local delete error: {e}")
                return False


storage_service = StorageService()
