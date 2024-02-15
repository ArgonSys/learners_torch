from django.db import models
from django.utils.translation import gettext as _


class Profile(models.Model):
    user = models.OneToOneField("users.User", verbose_name=_("user"), on_delete=models.CASCADE)
    icon = models.ImageField(_("icon"), upload_to=f"user_icons/{user.name}/", height_field=50, width_field=50, max_length=None, blank=True)
    bio = models.TextField(_("bio"), blank=True, null=True)
    first_name = models.CharField(_("first name"), max_length=50, blank=True, null=True)
    family_name = models.CharField(_("family name"), max_length=50, blank=True, null=True)
    web_site = models.CharField(_("web site"), max_length=150, blank=True, null=True)
    affiliation = models.CharField(_("affiliation"), max_length=150, blank=True, null=True)
    location = models.CharField(_("location"), max_length=150, blank=True, null=True)


class Link(models.Model):
    profile = models.ForeignKey(Profile, verbose_name=_("profile"), on_delete=models.CASCADE)
    link = models.CharField(_("link URL"), max_length=150)
