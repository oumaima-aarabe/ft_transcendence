from django.urls import path
from .views import signup_view, login_view, LogoutView, fortytwo_view, Login42API
from rest_framework_simplejwt.views import TokenRefreshView
# from .views import user_view 


urlpatterns = [
    path("sign_up", signup_view.as_view(), name='sign_up'),
    path("sign_in", login_view.as_view(), name='sign_in'),
    path("logout", LogoutView.as_view(), name='logout'),
    # path("user", user_view.as_view(), name='user'),
    path("42", fortytwo_view.as_view(), name='fortytwo'),
    path("42/callback", Login42API.as_view(), name='callback'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
