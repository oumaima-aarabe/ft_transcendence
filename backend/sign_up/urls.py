from django.urls import path
from .views import signup_view

urlpatterns = [
    path("sign_up", signup_view.as_view(), name='sign_up'),
]
