from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    help = "Run all migrations and create initial data"

    def add_arguments(self, parser):
        parser.add_argument(
            "--seed",
            action="store_true",
            help="Also run seed_demo after migrations",
        )

    def handle(self, *args, **options):
        self.stdout.write("Making migrations...")
        call_command("makemigrations", interactive=False)

        self.stdout.write("Running migrations...")
        call_command("migrate", interactive=False)

        self.stdout.write("Creating superuser...")
        call_command("create_superuser")

        if options["seed"]:
            self.stdout.write("Seeding demo data...")
            call_command("seed_demo")

        self.stdout.write(self.style.SUCCESS("Setup complete"))
