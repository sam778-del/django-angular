import logging
from django.contrib.auth import get_user_model
from core.utils.authentication import KeycloakAuthentication
from rest_framework.request import Request

logger = logging.getLogger(__name__)
User = get_user_model()


class AuthController:
    
    def __init__(self):
        self.auth = KeycloakAuthentication()

    def verify_token(self, request):
        try:
            result = self.auth.authenticate(request)
            
            if result is None:
                logger.warning("Authentication returned None - no Bearer token or invalid format")
                return {"active": False, "error": "No valid Bearer token found"}
            
            return result
            
        except Exception as e:
            logger.error(f"Token verification failed: {e}", exc_info=True)
            return {"active": False, "error": str(e)}

    def logout(self, refresh_token):
        try:
            self.auth.keycloak_openid.logout(refresh_token)
            logger.info("User logged out successfully")
            return True, None
        except Exception as e:
            logger.error(f"Logout error: {e}", exc_info=True)
            return False, str(e)

    def get_user_roles(self, user):
        roles = []
        if user.is_superuser or user.is_admin:
            roles.append("admin")
        if user.is_staff:
            roles.append("operator")
        if user.is_active:
            roles.append("viewer")
        return roles