from django.db import models
import uuid


class AbstractManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_removed=False)


class AbstractBaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    last_edited = models.DateTimeField(auto_now=True)
    is_removed = models.BooleanField(default=False)

    objects = models.Manager()
    living = AbstractManager()

    class Meta:
        abstract = True

    def soft_delete(self):
        self.is_removed = True
        self.save(update_fields=["is_removed", "last_edited"])

    def restore(self):
        self.is_removed = False
        self.save(update_fields=["is_removed", "last_edited"])


class TimestampMixin(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
