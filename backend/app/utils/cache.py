import time
import functools
import logging
from typing import Any, Optional, Union

logger = logging.getLogger("app.cache")

# Simple In-Memory storage if Redis is not available
_memory_cache = {}

def cache(expire: int = 300):
    """
    Standard professional caching decorator.
    Can be expanded to use Redis. For now, provides a robust in-memory fallback.
    """
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate a unique key based on function name and arguments
            cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            
            # Check cache
            if cache_key in _memory_cache:
                value, timestamp = _memory_cache[cache_key]
                if time.time() - timestamp < expire:
                    logger.info(f"Cache HIT for {func.__name__}")
                    return value
            
            # Cache MISS
            logger.info(f"Cache MISS for {func.__name__}. Executing...")
            result = await func(*args, **kwargs)
            
            # Store in cache
            _memory_cache[cache_key] = (result, time.time())
            return result
        
        # Sync version for regular functions
        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            if cache_key in _memory_cache:
                value, timestamp = _memory_cache[cache_key]
                if time.time() - timestamp < expire:
                    return value
            result = func(*args, **kwargs)
            _memory_cache[cache_key] = (result, time.time())
            return result

            
        import inspect
        if inspect.iscoroutinefunction(func):
            return wrapper
        return sync_wrapper
        
    return decorator
