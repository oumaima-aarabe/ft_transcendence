from django.urls import path
from .views import *

urlpatterns = [
    path("profile/<str:user_id>/", get_user_data, name="get_user_data"),
    path("search/<str:query>/", search_users, name="search_users"),
    path("update/", update_user_data, name="update_user_data"),
    path("upload-image/", upload_image, name="upload_image"),
    path("update-password/", update_password, name="update_password"),
]