from django.contrib import admin
from .models import Game, Match, Preferences

admin.site.register(Game)
admin.site.register(Match)
admin.site.register(Preferences)
