import logging
from core.models import Project, AuditLog

logger = logging.getLogger(__name__)

class ProjectController:
    
    def list(self, queryset=None):
        if queryset is None:
            queryset = Project.objects.all().order_by("-created_at")
        return queryset

    def create(self, user, data):
        members = data.pop("members", [])
        
        project = Project.objects.create(**data)
        
        if members:
            project.members.set(members)
        
        AuditLog.objects.create(
            user=user,
            action="create",
            model_name="Project",
            object_id=str(project.id),
            changes=str(data)
        )
        logger.info(f"Created project: {project.name}")
        return project

    def update(self, user, project, data):
        members = data.pop("members", None)
        
        for key, value in data.items():
            setattr(project, key, value)
        project.save()
        
        if members is not None:
            project.members.set(members)
        
        AuditLog.objects.create(
            user=user,
            action="update",
            model_name="Project",
            object_id=str(project.id),
            changes=str(data)
        )
        logger.info(f"Updated project: {project.id}")
        return project

    def delete(self, user, project):
        AuditLog.objects.create(
            user=user,
            action="delete",
            model_name="Project",
            object_id=str(project.id)
        )
        project.delete()
        logger.info(f"Deleted project: {project.id}")
        return True