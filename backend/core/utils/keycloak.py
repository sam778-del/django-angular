import logging
from django.conf import settings
from django.contrib.auth import get_user_model
from keycloak import KeycloakOpenID

logger = logging.getLogger(__name__)
User = get_user_model()


class KeycloakService:
    
    def __init__(self):
        self.openid = KeycloakOpenID(
            server_url=settings.KEYCLOAK_URL,
            client_id=settings.KEYCLOAK_CLIENT_ID,
            realm_name=settings.KEYCLOAK_REALM,
            client_secret_key=settings.KEYCLOAK_CLIENT_SECRET,
        )

    def create_or_update_user(self, token_info):
        keycloak_id = token_info.get("sub")
        email = token_info.get("email", "")
        username = token_info.get("preferred_username", email or f"user_{keycloak_id[:8]}")
        first_name = token_info.get("given_name", "")
        last_name = token_info.get("family_name", "")
        roles = self.extract_roles(token_info)
        
        try:
            user, created = User.objects.update_or_create(
                keycloak_id=keycloak_id,
                defaults={
                    "email": email,
                    "username": username,
                    "first_name": first_name,
                    "last_name": last_name,
                    "is_admin": "admin" in roles,
                    "is_staff": "operator" in roles or "admin" in roles,
                    "is_active": True,
                },
            )
            
            if created:
                logger.info(f"Created new user from Keycloak: {username} ({email})")
            else:
                logger.debug(f"Updated existing user: {username}")
            
            return user
            
        except Exception as e:
            logger.error(f"Failed to create/update user in database: {e}", exc_info=True)
            raise Exception(f"Failed to create user: {str(e)}")

    def extract_roles(self, token_info):
        roles = []
        resource_access = token_info.get("resource_access", {})
        
        django_roles = resource_access.get("django-backend", {}).get("roles", [])
        if django_roles:
            roles.extend(django_roles)
            logger.debug(f"Extracted django-backend roles: {django_roles}")
        
        angular_roles = resource_access.get("angular-frontend", {}).get("roles", [])
        if angular_roles:
            roles.extend(angular_roles)
            logger.debug(f"Extracted angular-frontend roles: {angular_roles}")
        
        return roles

    def introspect_token(self, token):
        return self.openid.introspect(token)

    def user_info(self, token):
        return self.openid.userinfo(token)

    def refresh_token(self, refresh_token):
        return self.openid.refresh_token(refresh_token)

    def logout(self, refresh_token):
        self.openid.logout(refresh_token)