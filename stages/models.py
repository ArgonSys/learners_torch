from django.db import models
from django.utils.translation import gettext_lazy as _


class Stage(models.Model):
    name = models.CharField(_("name"), max_length=50)
    description = models.TextField(_("description"), null=True, blank=True)
    plan = models.ForeignKey(
        "plans.Plan", verbose_name=_("plan"), on_delete=models.CASCADE
    )
    order = models.IntegerField(_("order"))
    date_created = models.DateTimeField(_("created at"), auto_now_add=True)
    date_updated = models.DateTimeField(_("updated at"), auto_now=True)

    class Meta:
        db_table = "stages"
