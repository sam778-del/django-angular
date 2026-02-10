import uuid
from django.db import models
from django.contrib.auth.models import PermissionsMixin, BaseUserManager
from django.contrib.auth.base_user import AbstractBaseUser
from common.models import AbstractBaseModel


class CustomUserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        normalized_email = self.normalize_email(email).lower()
        user = self.model(email=normalized_email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields["is_staff"] = True
        extra_fields["is_superuser"] = True
        extra_fields["is_admin"] = True
        return self.create_user(email, password, **extra_fields)

    def get_or_create_from_keycloak(self, token_info):
        keycloak_id = token_info.get("sub")
        email = token_info.get("email", "")
        username = token_info.get("preferred_username", email)
        first_name = token_info.get("given_name", "")
        last_name = token_info.get("family_name", "")
        
        roles = []
        realm_access = token_info.get("realm_access", {})
        roles.extend(realm_access.get("roles", []))
        
        user, created = self.update_or_create(
            keycloak_id=keycloak_id,
            defaults={
                "email": email,
                "username": username if username else email.split("@")[0],
                "first_name": first_name,
                "last_name": last_name,
                "is_admin": "admin" in roles,
                "is_staff": "operator" in roles or "admin" in roles,
                "is_active": True,
            },
        )
        return user, created


class CustomUser(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    keycloak_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = CustomUserManager()

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def get_roles(self):
        roles = []
        if self.is_superuser or self.is_admin:
            roles.append("admin")
        if self.is_staff:
            roles.append("operator")
        if self.is_active:
            roles.append("viewer")
        return roles

    def __str__(self):
        return self.email

    class Meta:
        ordering = ["email"]
        verbose_name = "User"
        verbose_name_plural = "Users"


class Organization(AbstractBaseModel):
    name = models.CharField(max_length=255)
    industry = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    website = models.URLField(blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Organization"
        verbose_name_plural = "Organizations"

    def __str__(self):
        return self.name


class Project(AbstractBaseModel):
    STATUS_CHOICES = [
        ("planning", "Planning"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("on_hold", "On Hold"),
        ("cancelled", "Cancelled"),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="planning")
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="projects"
    )
    manager = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="managed_projects"
    )
    members = models.ManyToManyField(
        CustomUser,
        blank=True,
        related_name="projects"
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Project"
        verbose_name_plural = "Projects"

    def __str__(self):
        return self.name


class Category(AbstractBaseModel):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Tag(AbstractBaseModel):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Record(AbstractBaseModel):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="records",
        null=True,
        blank=True
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name="records")
    creator = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name="created_records"
    )
    assigned_to = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_records"
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class Document(AbstractBaseModel):
    record = models.ForeignKey(Record, on_delete=models.CASCADE, related_name="documents")
    file = models.FileField(upload_to="documents/%Y/%m/%d/")
    description = models.CharField(max_length=255, blank=True)
    uploader = models.ForeignKey(CustomUser, on_delete=models.PROTECT, related_name="uploaded_documents")

    @property
    def file_name(self):
        return self.file.name.split('/')[-1] if self.file else ''

    @property
    def file_size(self):
        return self.file.size if self.file else 0

    @property
    def file_type(self):
        if self.file:
            return self.file.name.split('.')[-1].upper()
        return ''

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.record.title} - {self.file.name}"


class AuditLog(AbstractBaseModel):
    ACTION_CHOICES = [
        ("create", "Create"),
        ("update", "Update"),
        ("delete", "Delete"),
        ("login", "Login"),
        ("logout", "Logout"),
        ("permission_denied", "Permission Denied"),
    ]

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name="audit_logs",
    )
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=100, blank=True)
    object_id = models.CharField(max_length=255, blank=True)
    changes = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"

    def __str__(self):
        return f"{self.action} by {self.user}"