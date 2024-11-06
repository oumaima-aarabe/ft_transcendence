1. Queue System Functionality
   - Players can join a general queue for matchmaking
   - System needs to track:
     * Who is in queue
     * How long they've been waiting
     * Their skill level
     * Their current status (queuing, matched, cancelled)
   - Players can leave queue at any time

2. Friend Challenge System
   - Players can send game invites to friends
   - System needs to handle:
     * Sending invites
     * Storing pending invites
     * Invite expiration (after 5 minutes)
     * Accept/decline responses
     * Notifications to both players

3. Matchmaking Process
   - For Queue Matching:
     * System continuously checks for compatible players
     * Matches based on skill level
     * Widens skill range as wait time increases
     * Notifies both players when match is found
     * Gives brief window to accept/decline match

   - For Friend Challenges:
     * Direct invite -> notification -> accept/decline
     * No skill matching needed
     * Both players go directly to game when accepted

4. After Match is Made
   - Create game session
   - Move players from queue/invite to actual game
   - Initialize game room
   - Notify both players to join game

5. Edge Cases to Handle
   - Player disconnects during matchmaking
   - One player declines the match
   - Multiple simultaneous invites
   - Player in queue receives friend invite
   - Queue timeout handling


1. Queue Management APIs
   - Join Queue API
     * Endpoint purpose: Add player to matchmaking queue
     * What it handles: Player status, skill level tracking
     * Response: Queue position/estimated wait time

   - Leave Queue API
     * Endpoint purpose: Remove player from queue
     * What it handles: Cleanup of queue entry
     * Response: Confirmation of removal

   - Queue Status API
     * Endpoint purpose: Check current queue status
     * What it handles: Player's position, wait time
     * Response: Current queue state for player

2. Friend Challenge APIs
   - Send Game Invite API
     * Endpoint purpose: Send game invite to friend
     * What it handles: Create invitation, notify receiver
     * Response: Invite status

   - Accept Invite API
     * Endpoint purpose: Accept friend's game invite
     * What it handles: Create game session, notify sender
     * Response: Game session details

   - Decline Invite API
     * Endpoint purpose: Decline game invite
     * What it handles: Update invite status, notify sender
     * Response: Confirmation

3. Real-time WebSocket Connection
   - Purpose: Handle real-time matchmaking updates
   - What it handles:
     * Match found notifications
     * Queue position updates
     * Invite notifications
     * Match acceptance countdown
     * Game session creation

4. Match Status API
   - Purpose: Check status of pending match
   - What it handles: Match acceptance state
   - Response: Match status, opponent info




