from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from unfold.admin import ModelAdmin
from import_export.forms import ExportForm, ImportForm
from import_export.admin import ImportExportModelAdmin

from core.models import CustomUser, AuditLog, Category, Tag, Record, Document


@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin, ModelAdmin, ImportExportModelAdmin):
    import_form_class = ImportForm
    export_form_class = ExportForm
    
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        (
            "Personal info",
            {"fields": ("first_name", "last_name", "email", "keycloak_id")},
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "is_admin",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    list_display = ("username", "email", "first_name", "last_name", "is_staff", "is_admin")
    search_fields = ("username", "first_name", "last_name", "email")
    readonly_fields = ("keycloak_id",)


@admin.register(AuditLog)
class AuditLogAdmin(ModelAdmin):
    list_display = ("action", "user", "model_name", "object_id", "created_at")
    list_filter = ("action", "model_name", "created_at")
    search_fields = ("user__email", "object_id")
    readonly_fields = ("action", "user", "model_name", "object_id", "changes", "ip_address")

@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ["name", "created_at"]
    search_fields = ["name"]


@admin.register(Tag)
class TagAdmin(ModelAdmin):
    list_display = ["name", "created_at"]
    search_fields = ["name"]


@admin.register(Record)
class RecordAdmin(ModelAdmin):
    list_display = ["title", "status", "category", "creator", "created_at"]
    list_filter = ["status", "category", "created_at"]
    search_fields = ["title", "description"]


@admin.register(Document)
class DocumentAdmin(ModelAdmin):
    list_display = ["record", "file", "uploader", "created_at"]
    list_filter = ["created_at"]
