from django.db import models
from django.utils.translation import gettext_lazy as _

from users.models import User


class Plan(models.Model):
    name = models.CharField(_("name"), max_length=50)
    description = models.TextField(_("description"), null=True, blank=True)
    is_public = models.BooleanField(_("is_public"), default=False)
    # 学習時間データを利用するため、ownerを削除してもplanは保持される
    owner = models.ForeignKey(User, verbose_name=_("owner"), on_delete=models.PROTECT)
    permittees = models.ManyToManyField(
        User,
        related_name="plans",
        related_query_name="plan",
        through="PlansPermittees"
    )
    date_created = models.DateTimeField(_("created datetime"), auto_now_add=True)
    date_updated = models.DateTimeField(_("updated datetime"), auto_now=True)


    class Meta:
        db_table = "plans"
        verbose_name = _("plan")
        verbose_name_plural = _("plans")


class PlansPermittees(models.Model):
    plan = models.ForeignKey(Plan, on_delete=models.CASCADE)
    permittee = models.ForeignKey(User, on_delete=models.CASCADE)
    date_assigned = models.DateTimeField(_("assigned"), auto_now_add=True)
    class Meta:
        db_table ="plans_permittees"
