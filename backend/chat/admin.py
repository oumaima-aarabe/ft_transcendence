from django.contrib import admin
from .models import Conversation
from .models import Message

admin.site.register(Conversation)
admin.site.register(Message)
