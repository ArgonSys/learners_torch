from django.db import models
from django.utils.translation import gettext_lazy as _


class Task(models.Model):
    name = models.CharField(_("name"), max_length=50)
    description = models.TextField(_("description"), null=True, blank=True)
    # すべての task を pending stage に移動させてから stage は削除される
    stage = models.ForeignKey(
        "stages.Stage", verbose_name=_("stage"), on_delete=models.CASCADE
    )
    order = models.IntegerField(_("order"))
    is_done = models.BooleanField(_("is done"), default=False)
    date_created = models.DateTimeField(_("created at"), auto_now_add=True)
    date_updated = models.DateTimeField(_("updated at"), auto_now=True)

    class Meta:
        db_table = "tasks"
