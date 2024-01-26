# Generated by Django 5.0.1 on 2024-01-26 07:55

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("stages", "0001_initial"),
        ("tasks", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="TimeLog",
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
                ("planed_time", models.DurationField(verbose_name="planed time")),
                (
                    "date_created",
                    models.DateTimeField(
                        auto_now_add=True, verbose_name="created time"
                    ),
                ),
                (
                    "date_updated",
                    models.DateTimeField(auto_now=True, verbose_name="updated time"),
                ),
                (
                    "stage",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="stages.stage",
                        verbose_name="stage",
                    ),
                ),
                (
                    "task",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="tasks.task",
                        verbose_name="task",
                    ),
                ),
            ],
            options={
                "verbose_name": "time_log",
                "verbose_name_plural": "time_logs",
                "db_table": "time_logs",
            },
        ),
        migrations.CreateModel(
            name="ActualTime",
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
                ("date_started", models.DateTimeField(verbose_name="started time")),
                ("measured_time", models.DurationField(verbose_name="actual time")),
                (
                    "time_log",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="time_logs.timelog",
                        verbose_name="time log",
                    ),
                ),
            ],
            options={
                "verbose_name": "actual_time",
                "verbose_name_plural": "actual_times",
                "db_table": "actual_times",
            },
        ),
    ]
