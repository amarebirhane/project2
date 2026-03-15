import functools
import logging
import hashlib
from typing import Any, Optional
from app.services.redis_service import redis_service

logger = logging.getLogger("app.cache")

def cache(expire: int = 300):
    """
    Standard professional caching decorator that uses Redis.
    Falls back to normal execution if Redis is unavailable.
    """
    def decorator(func):
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            # Generate a unique key based on function name and hashed arguments
            args_str = f"{str(args)}:{str(kwargs)}"
            args_hash = hashlib.md5(args_str.encode()).hexdigest()
            cache_key = f"cache:{func.__name__}:{args_hash}"
            
            # Check cache
            cached_value = redis_service.get(cache_key)
            if cached_value is not None:
                logger.info(f"Cache HIT for {func.__name__}")
                return cached_value
            
            # Cache MISS
            logger.info(f"Cache MISS for {func.__name__}. Executing...")
            result = await func(*args, **kwargs)
            
            # Store in cache
            redis_service.set(cache_key, result, expire=expire)
            return result
        
        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            args_str = f"{str(args)}:{str(kwargs)}"
            args_hash = hashlib.md5(args_str.encode()).hexdigest()
            cache_key = f"cache:{func.__name__}:{args_hash}"
            
            cached_value = redis_service.get(cache_key)
            if cached_value is not None:
                logger.info(f"Cache HIT for {func.__name__}")
                return cached_value
                
            result = func(*args, **kwargs)
            redis_service.set(cache_key, result, expire=expire)
            return result

        import inspect
        if inspect.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper
        
    return decorator
