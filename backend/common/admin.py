from django.contrib import admin
from django.db import models
from import_export.admin import ImportExportModelAdmin
from unfold.admin import ModelAdmin


class BaseModelAdmin(ImportExportModelAdmin, ModelAdmin, admin.ModelAdmin):
    
    def get_search_fields(self, request):
        fields = []
        for field in self.model._meta.get_fields():
            if field.name in ["name", "title", "email"]:
                fields.append(field.name)
        return fields

    def get_ordering(self, request):
        if hasattr(self.model._meta, "ordering"):
            return self.model._meta.ordering
        return ["-created_at"] if self._has_field("created_at") else []

    def get_list_filter(self, request):
        filters = []
        for field in self.model._meta.get_fields():
            if isinstance(field, models.BooleanField):
                filters.append(field.name)
            elif isinstance(field, models.CharField) and field.choices:
                filters.append(field.name)
            elif isinstance(field, models.DateTimeField):
                filters.append(field.name)
        return filters

    def _has_field(self, field_name):
        return field_name in [f.name for f in self.model._meta.get_fields()]

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser
