import logging
from django.contrib.auth import get_user_model
from core.utils.keycloak import KeycloakService

logger = logging.getLogger(__name__)
User = get_user_model()


class UserController:
    
    def __init__(self):
        self.keycloak = KeycloakService()

    def get_all(self, queryset=None):
        if queryset is None:
            return User.objects.all()
        return queryset

    def get_by_id(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    def get_by_email(self, email):
        try:
            return User.objects.get(email=email)
        except User.DoesNotExist:
            return None

    def create(self, email, username, password, first_name, last_name, **kwargs):
        keycloak_id = self.keycloak.create_user(
            email=email,
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
        
        user = User.objects.create_user(
            email=email,
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
            keycloak_id=keycloak_id,
            **kwargs,
        )
        
        logger.info(f"Created user: {email}")
        return user

    def update(self, user, **kwargs):
        for key, value in kwargs.items():
            if hasattr(user, key):
                setattr(user, key, value)
        user.save()
        
        if user.keycloak_id:
            self.keycloak.update_user(user.keycloak_id, **kwargs)
        
        logger.info(f"Updated user: {user.email}")
        return user

    def delete(self, user):
        if user.keycloak_id:
            self.keycloak.delete_user(user.keycloak_id)
        
        user.delete()
        logger.info(f"Deleted user: {user.email}")
        return True

    def assign_role(self, user, role_name):
        if user.keycloak_id:
            self.keycloak._assign_role(user.keycloak_id, role_name)
        
        if role_name == "admin":
            user.is_admin = True
            user.is_staff = True
        elif role_name == "operator":
            user.is_staff = True
        
        user.save()
        logger.info(f"Assigned role {role_name} to user {user.email}")
        return user

    def get_roles(self, user):
        roles = []
        if user.is_superuser or user.is_admin:
            roles.append("admin")
        if user.is_staff:
            roles.append("operator")
        if user.is_active:
            roles.append("viewer")
        return roles
