from django.urls import path
from .views import Friend_view


urlpatterns = [
    path("/", Friend_view.as_view(), name='friends'),
    # path("/pending", Friend_view.as_view({'get': 'list'}), name='friends'),
]
