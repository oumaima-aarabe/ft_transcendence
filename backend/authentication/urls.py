from django.urls import path
from .views import (
    signup_view,
    login_view,
    LogoutView,
    fortytwo_view,
    Login42API,
    RefreshTokenView,
    VerifyTokenView,
)

urlpatterns = [
    path("sign_up", signup_view.as_view(), name='sign_up'),
    path("sign_in", login_view.as_view(), name='sign_in'),
    path("logout", LogoutView.as_view(), name='logout'),
    path("42", fortytwo_view.as_view(), name='fortytwo'),
    path("42/callback", Login42API.as_view(), name='callback'),
    path("token/refresh", RefreshTokenView.as_view(), name='token_refresh'),
    path("token/verify", VerifyTokenView.as_view(), name='token_verify'),
]
