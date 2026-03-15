import redis
import json
from typing import Any, Optional, Union
from app.core.config import settings

class RedisService:
    def __init__(self):
        self.client: Optional[redis.Redis] = None
        if settings.REDIS_URL:
            try:
                self.client = redis.from_url(settings.REDIS_URL, decode_responses=True)
            except Exception as e:
                print(f"Failed to connect to Redis: {e}")

    def set(self, key: str, value: Any, expire: int = 3600) -> bool:
        """
        Store a value in cache with an expiration time.
        """
        if not self.client:
            return False
        try:
            serialized_value = json.dumps(value)
            return self.client.set(key, serialized_value, ex=expire)
        except Exception as e:
            print(f"Redis set error: {e}")
            return False

    def get(self, key: str) -> Optional[Any]:
        """
        Retrieve a value from cache.
        """
        if not self.client:
            return None
        try:
            value = self.client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            print(f"Redis get error: {e}")
            return None

    def delete(self, key: str) -> bool:
        """
        Remove a value from cache.
        """
        if not self.client:
            return False
        try:
            return self.client.delete(key) > 0
        except Exception as e:
            print(f"Redis delete error: {e}")
            return False

    def flush_all(self) -> bool:
        """
        Clear all cache data.
        """
        if not self.client:
            return False
        try:
            return self.client.flushall()
        except Exception as e:
            print(f"Redis flush error: {e}")
            return False

redis_service = RedisService()
