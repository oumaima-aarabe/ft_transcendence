from django.urls import path
from .views import signup_view, login_view, logout_view, fortytwo_view
# from .views import user_view 


urlpatterns = [
    path("sign_up", signup_view.as_view(), name='sign_up'),
    path("login", login_view.as_view(), name='login'),
    path("logout", logout_view.as_view(), name='logout'),
    # path("user", user_view.as_view(), name='user'),
    path("42", fortytwo_view.as_view(), name='fortytwo'),
]
