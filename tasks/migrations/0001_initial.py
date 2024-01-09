# Generated by Django 5.0.1 on 2024-01-09 03:27

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("stages", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Task",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=50, verbose_name="name")),
                (
                    "description",
                    models.TextField(blank=True, null=True, verbose_name="description"),
                ),
                ("order", models.IntegerField(verbose_name="order")),
                ("is_done", models.BooleanField(default=False, verbose_name="is done")),
                (
                    "date_created",
                    models.DateTimeField(auto_now_add=True, verbose_name="created at"),
                ),
                (
                    "date_updated",
                    models.DateTimeField(auto_now=True, verbose_name="updated at"),
                ),
                (
                    "stage",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="stages.stage",
                        verbose_name="stage",
                    ),
                ),
            ],
            options={
                "db_table": "tasks",
            },
        ),
    ]
