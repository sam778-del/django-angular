import logging
from core.models import Organization, AuditLog

logger = logging.getLogger(__name__)


class OrganizationController:
    
    def list(self, queryset=None):
        if queryset is None:
            queryset = Organization.objects.filter(is_active=True).order_by("name")
        return queryset

    def create(self, user, data):
        organization = Organization.objects.create(**data)
        
        AuditLog.objects.create(
            user=user,
            action="create",
            model_name="Organization",
            object_id=str(organization.id),
            changes=str(data)
        )
        logger.info(f"Created organization: {organization.name}")
        return organization

    def update(self, user, organization, data):
        for key, value in data.items():
            setattr(organization, key, value)
        organization.save()
        
        AuditLog.objects.create(
            user=user,
            action="update",
            model_name="Organization",
            object_id=str(organization.id),
            changes=str(data)
        )
        logger.info(f"Updated organization: {organization.id}")
        return organization

    def delete(self, user, organization):
        AuditLog.objects.create(
            user=user,
            action="delete",
            model_name="Organization",
            object_id=str(organization.id)
        )
        organization.delete()
        logger.info(f"Deleted organization: {organization.id}")
        return True