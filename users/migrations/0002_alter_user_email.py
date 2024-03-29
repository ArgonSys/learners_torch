# Generated by Django 5.0.1 on 2024-02-24 12:13

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="email",
            field=models.EmailField(
                error_messages={
                    "unique": "A user with that email address already exists."
                },
                help_text="Required. Include @. Later part must be two or more . separated blocks",
                max_length=254,
                unique=True,
                verbose_name="email address",
            ),
        ),
    ]
