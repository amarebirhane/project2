import redis
import json
import logging
from typing import Any, Optional, Union
from app.core.config import settings

logger = logging.getLogger("app.redis")

class RedisService:
    def __init__(self):
        self.client: Optional[redis.Redis] = None
        self._is_connected = False
        self.connect()

    def connect(self):
        """Establish connection to Redis."""
        if settings.REDIS_URL:
            try:
                self.client = redis.from_url(
                    settings.REDIS_URL, 
                    decode_responses=True,
                    socket_timeout=2,
                    retry_on_timeout=True
                )
                self.client.ping()
                self._is_connected = True
                logger.info("Successfully connected to Redis")
            except Exception as e:
                self._is_connected = False
                logger.warning(f"Failed to connect to Redis: {e}. Caching will be disabled.")

    @property
    def is_available(self) -> bool:
        """Check if Redis service is currently available."""
        if not self._is_connected or not self.client:
            return False
        try:
            return self.client.ping()
        except:
            self._is_connected = False
            return False

    def set(self, key: str, value: Any, expire: int = 3600) -> bool:
        """Store a value in cache with an expiration time."""
        if not self.is_available:
            return False
        try:
            serialized_value = json.dumps(value)
            return self.client.set(key, serialized_value, ex=expire)
        except Exception as e:
            logger.error(f"Redis set error for key {key}: {e}")
            return False

    def get(self, key: str) -> Optional[Any]:
        """Retrieve a value from cache."""
        if not self.is_available:
            return None
        try:
            value = self.client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Redis get error for key {key}: {e}")
            return None

    def delete(self, key: str) -> bool:
        """Remove a value from cache."""
        if not self.is_available:
            return False
        try:
            return self.client.delete(key) > 0
        except Exception as e:
            logger.error(f"Redis delete error for key {key}: {e}")
            return False

    def flush_all(self) -> bool:
        """Clear all cache data."""
        if not self.is_available:
            return False
        try:
            return self.client.flushall()
        except Exception as e:
            logger.error(f"Redis flush error: {e}")
            return False

redis_service = RedisService()
