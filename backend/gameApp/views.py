from django.shortcuts import render
from django.contrib.auth.models import User
from django.http import JsonResponse
from .matching import QueueEntry, GameInvite


matchmaking_queue = []  #QueueEntries in memory storage
invites = [] #in memory storage of invites to user

def add_to_queue(request):
    if request.method == 'POST':
        user = request.user  # !check authentication
        skill_rating = request.POST.get('skill_rating', 0.0)  # get skill rating from request
        entry = QueueEntry(user, float(skill_rating))
        matchmaking_queue.append(entry)
        return JsonResponse({'status': 'added to queue', 'user': user.username})

def remove_from_queue(request):
    if request.method == 'POST':
        user = request.user
        global matchmaking_queue
        matchmaking_queue = [entry for entry in matchmaking_queue if entry.user != user]
        return JsonResponse({'status': 'removed from queue', 'user': user.username})



def send_game_invite(request):
    if request.method == 'POST':
        sender = request.user # !check authentication
        receiver_username = request.POST.get('receiver')
        receiver = User.objects.get(username=receiver_username)
        
        invite = GameInvite(sender, receiver)
        invites.append(invite)
        return JsonResponse({'status': 'invite sent', 'receiver': receiver.username})

def check_invite_status(request, invite_id):
    invite = invites[int(invite_id)]
    
    return JsonResponse({
        'sender': invite.sender.username,
        'receiver': invite.receiver.username,
        'status': invite.status
    })
