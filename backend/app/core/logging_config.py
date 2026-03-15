import logging
import sys
import uuid
from typing import Any

class RequestContextFilter(logging.Filter):
    """Filter that adds a unique request_id to every log record."""
    def __init__(self):
        super().__init__()
        self.request_id = str(uuid.uuid4())

    def filter(self, record):
        record.request_id = getattr(record, "request_id", self.request_id)
        return True

def setup_logging():
    """Configures the root logger with a professional format."""
    log_format = (
        "%(asctime)s | %(levelname)-8s | ReqID: %(request_id)s | "
        "%(name)s:%(funcName)s:%(lineno)d - %(message)s"
    )
    
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(log_format))
    
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.addHandler(handler)
    
    # Add request ID filter to all logs
    root_logger.addFilter(RequestContextFilter())
    
    # Clean up standard FastAPI/Uvicorn access logs to match
    logging.getLogger("uvicorn.access").handlers = [handler]
    logging.getLogger("fastapi").handlers = [handler]

setup_logging()
logger = logging.getLogger("app")
