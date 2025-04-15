import base64
import os
import tempfile
from django.conf import settings
import requests
from authentication.models import User
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from .serializers import *
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.db.models import Q
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Notification
from .serializers import NotificationSerializer
from friends.models import Friend


@permission_classes([IsAuthenticated])
@api_view(["GET"])
def get_user_data(request, user_id):
    try:
        user = request.user if user_id == "me" else User.objects.get(username=user_id)
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


@permission_classes([IsAuthenticated])
@api_view(['PATCH'])
def update_user_data(request):
    serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@permission_classes([IsAuthenticated])
@api_view(['GET'])
def all_users(request):
    users = User.objects.all()
    return Response(UserSerializer(users, many=True).data)


@permission_classes([IsAuthenticated])
@api_view(['GET'])
def search_users(request, query):
    if not query:
        return Response([])

    # Get users who have blocked the current user or are blocked by the current user
    blocked_relation = Friend.objects.filter(
        (Q(sender=request.user) | Q(recipient=request.user)) &
        Q(state='blocked')
    ).values_list('sender', 'recipient')
    
    # Extract all user IDs involved in blocking relationships
    blocked_users = set()
    for sender_id, recipient_id in blocked_relation:
        if sender_id == request.user.id:
            blocked_users.add(recipient_id)  # Users blocked by current user
        elif recipient_id == request.user.id:
            blocked_users.add(sender_id)  # Users who blocked current user

    # Find users matching the search query but exclude blocked users
    users = User.objects.filter(
        Q(username__icontains=query) |
        Q(first_name__icontains=query) |
        Q(last_name__icontains=query)
    ).exclude(
        id=request.user.id
    ).exclude(
        id__in=blocked_users
    )[:5]

    return Response(UserSerializer(users, many=True).data)


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([IsAuthenticated])
def upload_image(request):
    image = request.data.get("image")
    if not image:
        return Response({"message": "No image provided"}, status=status.HTTP_400_BAD_REQUEST)
    if image.size > settings.MAX_FILE_SIZE:
        return Response({"message": "File is too large"}, status=status.HTTP_400_BAD_REQUEST)
    if not image.name.lower().endswith((".png", ".jpg", ".jpeg", ".gif")):
        return Response({"message": "File type not supported"}, status=status.HTTP_400_BAD_REQUEST)
    if image.size == 0:
        return Response({"message": "File is empty"}, status=status.HTTP_400_BAD_REQUEST)

    API_KEY = os.environ.get("FREEIMAGE_API_KEY")
    if not API_KEY:
        return Response({"message": "Image upload service not configured"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    API_ENDPOINT = "https://freeimage.host/api/1/upload"

    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        try:
            for chunk in image.chunks():
                temp_file.write(chunk)
            temp_file.flush()

            with open(temp_file.name, "rb") as f:
                image_data = base64.b64encode(f.read()).decode("utf-8")

            payload = {
                "key": API_KEY,
                "action": "upload",
                "source": image_data,
                "format": "json"
            }

            response = requests.post(API_ENDPOINT, data=payload)
            response.raise_for_status()
            image_url = response.json()["image"]["image"]["url"]
            return Response({"url": image_url}, status=status.HTTP_201_CREATED)

        except requests.exceptions.RequestException as e:
            return Response(
                {"message": "Error uploading image to external service"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            return Response(
                {"message": "Error processing image"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        finally:
            # Clean up the temporary file
            if os.path.exists(temp_file.name):
                os.unlink(temp_file.name)


@permission_classes([IsAuthenticated])
@api_view(['POST'])
def update_password(request):
    if "1337.ma" in request.user.email:
        return Response({"code": "intra_email"}, status=status.HTTP_400_BAD_REQUEST)

    if not request.data.get("old_password") or not request.data.get("new_password"):
        return Response({"code": "data_missing"}, status=status.HTTP_400_BAD_REQUEST)
    if not request.user.check_password(request.data.get("old_password")):
        return Response({"code": "old_incorrect"}, status=status.HTTP_400_BAD_REQUEST)
    request.user.set_password(request.data.get("new_password"))
    request.user.save()
    return Response({"code": "password_updated"}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    notifications = Notification.objects.filter(recipient=request.user)
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unread_notifications(request):
    notifications = Notification.objects.filter(recipient=request.user, is_read=False)
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    try:
        notification = Notification.objects.get(id=notification_id, recipient=request.user)
        notification.is_read = True
        notification.save()
        return Response({'status': 'success'})
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    return Response({'status': 'success'})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notification(request, notification_id):
    try:
        notification = Notification.objects.get(id=notification_id, recipient=request.user)
        notification.delete()
        return Response({'status': 'success'})
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
