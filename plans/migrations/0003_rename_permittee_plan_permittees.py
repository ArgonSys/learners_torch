# Generated by Django 5.0 on 2023-12-28 11:39

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("plans", "0002_planspermittees_alter_plan_permittee_and_more"),
    ]

    operations = [
        migrations.RenameField(
            model_name="plan",
            old_name="permittee",
            new_name="permittees",
        ),
    ]
