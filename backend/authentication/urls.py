from django.urls import path
from .views import signup_view, login_view

urlpatterns = [
    path("sign_up", signup_view.as_view(), name='sign_up'),
    path("login", login_view.as_view(), name='login'),
]
