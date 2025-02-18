from django.urls import path
from .views import UserView


urlpatterns = [
    path("<str:username>", UserView.as_view(), name='profile'),
]
