import logging
from core.models import Record, Document, AuditLog
from core.utils.pagination import StandardPagination

logger = logging.getLogger(__name__)


class RecordController:
    
    def list(self, request, queryset=None):
        if queryset is None:
            queryset = Record.objects.all().order_by("-created_at")
            
        paginator = StandardPagination()
        page = paginator.paginate_queryset(queryset, request)
        
        if page is not None:
            return page, paginator
            
        return queryset, None

    def create(self, user, data):
        tags = data.pop("tags", [])
        
        record = Record.objects.create(creator=user, **data)
        
        if tags:
            record.tags.set(tags)
        
        AuditLog.objects.create(
            user=user,
            action="create",
            model_name="Record",
            object_id=str(record.id),
            changes=str(data) 
        )
        logger.info(f"Created record: {record.title}")
        return record

    def update(self, user, record, data):
        tags = data.pop("tags", None)
        
        for key, value in data.items():
            setattr(record, key, value)
        record.save()
        
        if tags is not None:
            record.tags.set(tags)
        
        AuditLog.objects.create(
            user=user,
            action="update",
            model_name="Record",
            object_id=str(record.id),
            changes=str(data)
        )
        logger.info(f"Updated record: {record.id}")
        return record

    def delete(self, user, record):
        AuditLog.objects.create(
            user=user,
            action="delete",
            model_name="Record",
            object_id=str(record.id)
        )
        record.delete()
        logger.info(f"Deleted record: {record.id}")
        return True


class DocumentController:
    
    def create(self, user, data):
        document = Document.objects.create(uploader=user, **data)
        
        logger.info(f"Uploaded document: {document.file.name}")
        return document
