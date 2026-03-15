from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware that adds professional security headers to all responses.
    """
    async def dispatch(self, request, call_next):
        response: Response = await call_next(request)
        
        # 1. HSTS (Strict-Transport-Security)
        # Tells browsers to only use HTTPS. (6 months)
        response.headers["Strict-Transport-Security"] = "max-age=15768000; includeSubDomains"
        
        # 2. X-Content-Type-Options: nosniff
        # Prevents the browser from MIME-sniffing a response away from the declared content-type.
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # 3. X-Frame-Options: DENY
        # Prevents clickjacking by forbidding the page to be displayed in a frame.
        response.headers["X-Frame-Options"] = "DENY"
        
        # 4. Content-Security-Policy (CSP)
        # Extremely restrictive by default
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; object-src 'none';"
        
        # 5. X-XSS-Protection
        # Legacy but still good for older browsers.
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # 6. Referrer-Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        return response
