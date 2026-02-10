import jwt
from django.conf import settings
from rest_framework import authentication, exceptions
from drf_spectacular.extensions import OpenApiAuthenticationExtension
from core.utils.keycloak import KeycloakService


class KeycloakAuthentication(authentication.BaseAuthentication):

    def __init__(self):
        self.keycloak_service = KeycloakService()

    def authenticate(self, request):
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth_header:
            return None
        
        if not auth_header.startswith("Bearer "):
            return None
    
        token = auth_header.split(" ")[1]
        try:
            token_info = self._verify_token(token)
            user = self.keycloak_service.create_or_update_user(token_info)
            
            auth_data = {
                "user": user,
                "token": token,
                "expires_at": token_info.get("exp"),
                "issued_at": token_info.get("iat"),
                "roles": self.keycloak_service.extract_roles(token_info),
            }
            
            return (user, auth_data)
            
        except Exception as e:
            raise exceptions.AuthenticationFailed(f"Authentication failed: {str(e)}")

    def _verify_token(self, token):
        try:
            public_key = f"-----BEGIN PUBLIC KEY-----\n{settings.KEYCLOAK_PUBLIC_KEY}\n-----END PUBLIC KEY-----"
            
            token_info = jwt.decode(
                token,
                public_key,
                algorithms=["RS256"],
                audience=settings.KEYCLOAK_CLIENT_ID,
                options={
                    "verify_signature": True,
                    "verify_aud": True,
                    "verify_exp": True,
                }
            )
            
            return token_info
            
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed("Token has expired")
        except jwt.InvalidAudienceError:
            raise exceptions.AuthenticationFailed("Token has invalid audience")
        except jwt.InvalidTokenError as e:
            raise exceptions.AuthenticationFailed(f"Invalid token: {str(e)}")
        except Exception as e:
            raise exceptions.AuthenticationFailed(f"Token verification failed: {str(e)}")


class KeycloakAuthenticationScheme(OpenApiAuthenticationExtension):
    target_class = "core.utils.authentication.KeycloakAuthentication"
    name = "KeycloakBearerAuth"

    def get_security_definition(self, auto_schema):
        return {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Keycloak JWT token authentication. Format: Bearer {token}"
        }