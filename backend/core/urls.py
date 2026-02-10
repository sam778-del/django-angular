from django.urls import include, path
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static

from core.views import (
    HealthCheckView,
    ValidateTokenView,
    MeView,
    LogoutView,
    UserViewSet,
    OrganizationViewSet,
    ProjectViewSet,
    CategoryViewSet,
    TagViewSet,
    RecordViewSet,
    DocumentViewSet,
)

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="users")
router.register(r"organizations", OrganizationViewSet, basename="organizations")
router.register(r"projects", ProjectViewSet, basename="projects")
router.register(r"categories", CategoryViewSet, basename="categories")
router.register(r"tags", TagViewSet, basename="tags")
router.register(r"records", RecordViewSet, basename="records")
router.register(r"documents", DocumentViewSet, basename="documents")

admin.site.site_header = "Prisco Admin"
admin.site.site_title = "Prisco Admin"
admin.site.index_title = "Prisco Administration"

urlpatterns = [
    path("api/health/", HealthCheckView.as_view(), name="health_check"),
    path("api/auth/validate-token/", ValidateTokenView.as_view(), name="validate_token"),
    path("api/auth/me/", MeView.as_view(), name="me"),
    path("api/auth/logout/", LogoutView.as_view(), name="logout"),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    path("api/", include(router.urls)),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)