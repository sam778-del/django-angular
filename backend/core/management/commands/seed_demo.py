from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import AuditLog, Category, Tag, Record, Document
from core.utils.keycloak import KeycloakService

User = get_user_model()


class Command(BaseCommand):
    help = "Seed database with demo data"

    def handle(self, *args, **options):
        self.keycloak = KeycloakService()
        
        self._create_demo_users()
        self._create_reference_data()
        self._create_demo_scenarios()
        
        self.stdout.write(self.style.SUCCESS("Database seeded successfully"))

    def _create_demo_users(self):
        users_data = [
            {
                "email": "admin@example.com",
                "username": "admin",
                "password": "admin",
                "first_name": "Demo",
                "last_name": "Admin",
                "roles": ["admin"],
            },
            {
                "email": "demo_operator@example.com",
                "username": "demo_operator",
                "password": "DemoOperator123!",
                "first_name": "Demo",
                "last_name": "Operator",
                "roles": ["operator"],
            },
            {
                "email": "demo_viewer@example.com",
                "username": "demo_viewer",
                "password": "DemoViewer123!",
                "first_name": "Demo",
                "last_name": "Viewer",
                "roles": ["viewer"],
            },
        ]

        for data in users_data:
            roles = data.pop("roles")
            email = data["email"]
            
            try:
                keycloak_id = self.keycloak.create_user(**data, roles=roles)
            except Exception:
                kc_user = self.keycloak.get_user_by_email(email)
                keycloak_id = kc_user["id"] if kc_user else None

            user, created = User.objects.update_or_create(
                email=email,
                defaults={
                    "username": data["username"],
                    "first_name": data["first_name"],
                    "last_name": data["last_name"],
                    "keycloak_id": keycloak_id,
                    "is_active": True,
                    "is_admin": "admin" in roles,
                    "is_staff": "operator" in roles or "admin" in roles,
                },
            )
            if created:
                user.set_password(data["password"])
                user.save()

    def _create_reference_data(self):
        categories = ["Finance", "HR", "Legal", "Operations", "Sales"]
        for name in categories:
            Category.objects.get_or_create(name=name, defaults={"description": f"{name} Department"})

        tags = ["Urgent", "Review", "Approved", "Rejected", "Pending", "Draft"]
        for name in tags:
            Tag.objects.get_or_create(name=name)

    def _create_demo_scenarios(self):
        admin = User.objects.filter(email="demo_admin@example.com").first()
        operator = User.objects.filter(email="demo_operator@example.com").first()
        viewer = User.objects.filter(email="demo_viewer@example.com").first()
        
        if not (admin and operator and viewer):
            return

        cat_ops = Category.objects.get(name="Operations")
        cat_hr = Category.objects.get(name="HR")
        cat_finance = Category.objects.get(name="Finance")
        
        tag_urgent = Tag.objects.get(name="Urgent")
        tag_draft = Tag.objects.get(name="Draft")
        tag_pending = Tag.objects.get(name="Pending")

        record1 = Record.objects.create(
            title="Quarterly Report Q3",
            description="Financial performance analysis for Q3",
            status="draft",
            category=cat_finance,
            creator=viewer,
        )
        record1.tags.add(tag_draft)
        
        AuditLog.objects.create(
            user=viewer,
            action="create",
            model_name="Record",
            object_id=str(record1.id),
            changes={"title": record1.title, "status": "draft"}
        )

        record1.status = "in_progress"
        record1.save()
        AuditLog.objects.create(
            user=operator,
            action="update",
            model_name="Record",
            object_id=str(record1.id),
            changes={"status": "in_progress"}
        )

        tasks = [
            ("Server Upgrade", cat_ops, "in_progress"),
            ("Employee Onboarding", cat_hr, "draft"),
            ("Budget Review", cat_finance, "approved"),
        ]
        
        for i, (title, cat, status) in enumerate(tasks):
            rec = Record.objects.create(
                title=title,
                description=f"Task for {cat.name}",
                status=status,
                category=cat,
                creator=admin,
                assigned_to=operator,
            )
            if status == "in_progress":
                rec.tags.add(tag_urgent)
            elif status == "draft":
                rec.tags.add(tag_pending)

        AuditLog.objects.create(
            user=admin,
            action="create",
            model_name="Category",
            object_id="Marketing",
            changes={"name": "Marketing"}
        )
        Category.objects.get_or_create(name="Marketing")
