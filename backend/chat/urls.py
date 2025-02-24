from django.urls import path
from . import views

urlpatterns = [
    path('conversations/create/', views.create_conversation, name='create_conversation'),
    path('conversations/', views.get_conversations, name='get_conversations'),
    path('messages/', views.get_messages, name='get_messages'),
    path('search/users/', views.search_users, name='search-users'),
    path('conversations/<str:conversation_id>/', views.DeleteConversation, name='delete-conversation'),
]
