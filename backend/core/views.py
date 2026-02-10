import logging
from django.http import HttpRequest
from rest_framework.request import Request
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from core.models import CustomUser, Organization, Project, Category, Tag, Record, Document
from core.serializers import (
    UserSerializer,
    OrganizationSerializer,
    ProjectSerializer,
    CategorySerializer,
    TagSerializer,
    RecordSerializer,
    DocumentSerializer,
    TokenValidationRequestSerializer,
    TokenValidationResponseSerializer,
)
from core.controllers.auth import AuthController
from core.controllers.record import RecordController, DocumentController
from core.controllers.organization import OrganizationController
from core.controllers.project import ProjectController
from core.controllers.user import UserController
from core.utils.authentication import KeycloakAuthentication
from core.utils.permissions import IsAdminOrReadOnly, IsOperatorOrReadOnly

logger = logging.getLogger(__name__)


class HealthCheckView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(tags=["Health"], responses={200: OpenApiTypes.OBJECT})
    def get(self, request):
        return Response({
            "status": "healthy",
            "timestamp": timezone.now().isoformat(),
        })


class ValidateTokenView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(
        tags=["Auth"],
        summary="Validate Keycloak token",
        description="Validates a Keycloak JWT token and returns user information with roles",
        request=TokenValidationRequestSerializer,
        responses={
            200: TokenValidationResponseSerializer,
            400: TokenValidationResponseSerializer,
            401: TokenValidationResponseSerializer,
        }
    )
    def post(self, request):
        serializer = TokenValidationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data["token"]
        
        mock_request = HttpRequest()
        mock_request.META = {"HTTP_AUTHORIZATION": f"Bearer {token}"}
        drf_request = Request(mock_request)
        
        controller = AuthController()
        
        try:
            token_info = controller.verify_token(drf_request)
        except Exception as e:
            logger.error(f"Token verification exception: {e}", exc_info=True)
            return Response(
                {"valid": False, "error": f"Token verification failed: {str(e)}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        if not token_info:
            logger.warning("Token verification returned None")
            return Response(
                {"valid": False, "error": "Failed to validate token"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        user, auth_data = token_info
            
        response_data = {
            "valid": True,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_admin": user.is_admin,
                "is_staff": user.is_staff,
                "keycloak_id": user.keycloak_id,
            },
            "token": auth_data.get("token"),
            "expires_at": auth_data.get("expires_at"),
            "issued_at": auth_data.get("issued_at"),
            "roles": auth_data.get("roles"),
        }
        
        return Response(response_data, status=status.HTTP_200_OK)


class MeView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [KeycloakAuthentication]

    @extend_schema(
        tags=["Auth"],
        summary="Get current user profile",
        description="Returns the authenticated user's profile information",
        responses={200: UserSerializer}
    )
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [KeycloakAuthentication]

    @extend_schema(
        tags=["Auth"],
        summary="Logout user",
        description="Invalidates the refresh token in Keycloak",
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "refresh_token": {"type": "string"}
                },
                "required": ["refresh_token"]
            }
        },
        responses={
            205: OpenApiTypes.OBJECT,
            400: OpenApiTypes.OBJECT
        }
    )
    def post(self, request):
        refresh_token = request.data.get("refresh_token")
        
        if not refresh_token:
            return Response(
                {"error": "Refresh token required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        controller = AuthController()
        success, error = controller.logout(refresh_token)
        
        if error:
            return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(
            {"message": "Logout successful"},
            status=status.HTTP_205_RESET_CONTENT
        )


@extend_schema_view(
    list=extend_schema(tags=["Users"], summary="List all users"),
    retrieve=extend_schema(tags=["Users"], summary="Get user by ID"),
    create=extend_schema(tags=["Users"], summary="Create new user"),
    update=extend_schema(tags=["Users"], summary="Update user"),
    partial_update=extend_schema(tags=["Users"], summary="Partial update user"),
    destroy=extend_schema(tags=["Users"], summary="Delete user"),
)
class UserViewSet(ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [KeycloakAuthentication]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ["email", "is_staff", "is_admin"]
    ordering_fields = ["email", "first_name", "last_name", "date_joined"]
    search_fields = ["email", "first_name", "last_name", "username"]

    @extend_schema(
        tags=["Users"],
        summary="Assign role to user",
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "role": {"type": "string", "enum": ["admin", "operator", "viewer"]}
                },
                "required": ["role"]
            }
        },
        responses={200: OpenApiTypes.OBJECT, 400: OpenApiTypes.OBJECT}
    )
    @action(detail=True, methods=["post"], url_path="assign-role")
    def assign_role(self, request, pk=None):
        user = self.get_object()
        role = request.data.get("role")
        if not role:
            return Response({"error": "Role required"}, status=status.HTTP_400_BAD_REQUEST)
            
        UserController().assign_role(user, role)
        return Response({"status": "role assigned"})


@extend_schema_view(
    list=extend_schema(tags=["Organizations"], summary="List all organizations"),
    retrieve=extend_schema(tags=["Organizations"], summary="Get organization by ID"),
    create=extend_schema(tags=["Organizations"], summary="Create new organization"),
    update=extend_schema(tags=["Organizations"], summary="Update organization"),
    partial_update=extend_schema(tags=["Organizations"], summary="Partial update organization"),
    destroy=extend_schema(tags=["Organizations"], summary="Delete organization"),
)
class OrganizationViewSet(ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [KeycloakAuthentication]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ["is_active", "industry"]
    ordering_fields = ["name", "created_at", "industry"]
    search_fields = ["name", "industry", "email"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = OrganizationController().create(request.user, serializer.validated_data)
        headers = self.get_success_headers(serializer.data)
        return Response(
            self.get_serializer(instance).data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        updated_instance = OrganizationController().update(
            request.user,
            instance,
            serializer.validated_data
        )
        return Response(self.get_serializer(updated_instance).data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        OrganizationController().delete(request.user, instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema_view(
    list=extend_schema(tags=["Projects"], summary="List all projects"),
    retrieve=extend_schema(tags=["Projects"], summary="Get project by ID"),
    create=extend_schema(tags=["Projects"], summary="Create new project"),
    update=extend_schema(tags=["Projects"], summary="Update project"),
    partial_update=extend_schema(tags=["Projects"], summary="Partial update project"),
    destroy=extend_schema(tags=["Projects"], summary="Delete project"),
)
class ProjectViewSet(ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [KeycloakAuthentication]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ["status", "organization", "manager"]
    ordering_fields = ["name", "created_at", "start_date", "end_date"]
    search_fields = ["name", "description"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = ProjectController().create(request.user, serializer.validated_data)
        headers = self.get_success_headers(serializer.data)
        return Response(
            self.get_serializer(instance).data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        updated_instance = ProjectController().update(
            request.user,
            instance,
            serializer.validated_data
        )
        return Response(self.get_serializer(updated_instance).data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        ProjectController().delete(request.user, instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema_view(
    list=extend_schema(tags=["Categories"], summary="List all categories"),
    retrieve=extend_schema(tags=["Categories"], summary="Get category by ID"),
    create=extend_schema(tags=["Categories"], summary="Create new category"),
    update=extend_schema(tags=["Categories"], summary="Update category"),
    partial_update=extend_schema(tags=["Categories"], summary="Partial update category"),
    destroy=extend_schema(tags=["Categories"], summary="Delete category"),
)
class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    authentication_classes = [KeycloakAuthentication]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ["name"]
    search_fields = ["name"]


@extend_schema_view(
    list=extend_schema(tags=["Tags"], summary="List all tags"),
    retrieve=extend_schema(tags=["Tags"], summary="Get tag by ID"),
    create=extend_schema(tags=["Tags"], summary="Create new tag"),
    update=extend_schema(tags=["Tags"], summary="Update tag"),
    partial_update=extend_schema(tags=["Tags"], summary="Partial update tag"),
    destroy=extend_schema(tags=["Tags"], summary="Delete tag"),
)
class TagViewSet(ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAdminOrReadOnly]
    authentication_classes = [KeycloakAuthentication]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ["name"]
    search_fields = ["name"]


@extend_schema_view(
    list=extend_schema(tags=["Records"], summary="List all records"),
    retrieve=extend_schema(tags=["Records"], summary="Get record by ID"),
    create=extend_schema(tags=["Records"], summary="Create new record"),
    update=extend_schema(tags=["Records"], summary="Update record"),
    partial_update=extend_schema(tags=["Records"], summary="Partial update record"),
    destroy=extend_schema(tags=["Records"], summary="Delete record"),
)
class RecordViewSet(ModelViewSet):
    queryset = Record.objects.all()
    serializer_class = RecordSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ["status", "category", "assigned_to"]
    ordering_fields = ["created_at", "status", "title"]
    search_fields = ["title", "description"]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        page, paginator = RecordController().list(request, queryset=queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = RecordController().create(request.user, serializer.validated_data)
        headers = self.get_success_headers(serializer.data)
        return Response(
            self.get_serializer(instance).data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        updated_instance = RecordController().update(
            request.user,
            instance,
            serializer.validated_data
        )
        return Response(self.get_serializer(updated_instance).data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        RecordController().delete(request.user, instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema_view(
    list=extend_schema(tags=["Documents"], summary="List all documents"),
    retrieve=extend_schema(tags=["Documents"], summary="Get document by ID"),
    create=extend_schema(tags=["Documents"], summary="Upload new document"),
    destroy=extend_schema(tags=["Documents"], summary="Delete document"),
)
class DocumentViewSet(ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsOperatorOrReadOnly]
    authentication_classes = [KeycloakAuthentication]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["record"]
    ordering_fields = ["created_at"]
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = DocumentController().create(request.user, serializer.validated_data)
        headers = self.get_success_headers(serializer.data)
        return Response(
            self.get_serializer(instance).data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )