from django.urls import path
from .views import *

urlpatterns = [
    path("profile/<str:user_id>/", get_user_data, name="get_user_data"),
    path("all-users/", all_users, name="all_users"),
    path("search/<str:query>/", search_users, name="search_users"),
    path("update/", update_user_data, name="update_user_data"),
    path("upload-image/", upload_image, name="upload_image"),
    path("update-password/", update_password, name="update_password"),
    path('notifications/', get_notifications, name='get_notifications'),
    path('notifications/unread/', get_unread_notifications, name='get_unread_notifications'),
    path('notifications/mark-read/<int:notification_id>/', mark_notification_read, name='mark_notification_read'),
    path('notifications/mark-all-read/', mark_all_notifications_read, name='mark_all_notifications_read'),
    path('notifications/delete/<int:notification_id>/', delete_notification, name='delete_notification'),
]