from rest_framework import serializers
from core.models import CustomUser, Organization, Project, Category, Tag, Record, Document


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    roles = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "full_name",
            "is_admin",
            "is_staff",
            "is_active",
            "date_joined",
            "roles"
        ]
        read_only_fields = ["id", "date_joined", "full_name", "roles"]

    def get_roles(self, obj):
        return obj.get_roles()


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = [
            "id",
            "name",
            "industry",
            "description",
            "website",
            "email",
            "phone",
            "address",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class ProjectSerializer(serializers.ModelSerializer):
    organization_detail = OrganizationSerializer(source="organization", read_only=True)
    manager_detail = UserSerializer(source="manager", read_only=True)
    members_detail = UserSerializer(source="members", many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "description",
            "status",
            "start_date",
            "end_date",
            "organization",
            "organization_detail",
            "manager",
            "manager_detail",
            "members",
            "members_detail",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "description", "created_at"]
        read_only_fields = ["id", "created_at"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name", "created_at"]
        read_only_fields = ["id", "created_at"]


class DocumentSerializer(serializers.ModelSerializer):
    file_name = serializers.CharField(read_only=True)
    file_size = serializers.IntegerField(read_only=True)
    file_type = serializers.CharField(read_only=True)
    uploader_detail = UserSerializer(source="uploader", read_only=True)

    class Meta:
        model = Document
        fields = [
            "id",
            "record",
            "file",
            "file_name",
            "file_size",
            "file_type",
            "description",
            "uploader",
            "uploader_detail",
            "created_at"
        ]
        read_only_fields = ["id", "created_at", "uploader", "file_name", "file_size", "file_type"]


class RecordSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source="category", read_only=True)
    tags_detail = TagSerializer(source="tags", many=True, read_only=True)
    documents = DocumentSerializer(many=True, read_only=True)
    creator_detail = UserSerializer(source="creator", read_only=True)
    assigned_to_detail = UserSerializer(source="assigned_to", read_only=True)

    class Meta:
        model = Record
        fields = [
            "id",
            "title",
            "description",
            "status",
            "category",
            "category_detail",
            "tags",
            "tags_detail",
            "creator",
            "creator_detail",
            "assigned_to",
            "assigned_to_detail",
            "documents",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "creator"]

class TokenValidationRequestSerializer(serializers.Serializer):
    token = serializers.CharField(required=True, help_text="JWT token from Keycloak")

class TokenValidationResponseSerializer(serializers.Serializer):
    valid = serializers.BooleanField()
    user = UserSerializer(required=False)
    token = serializers.CharField(required=False)
    expires_at = serializers.IntegerField(required=False, help_text="Unix timestamp when token expires")
    issued_at = serializers.IntegerField(required=False, help_text="Unix timestamp when token was issued")
    roles = serializers.ListField(child=serializers.CharField(), required=False)
    error = serializers.CharField(required=False)