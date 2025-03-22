- clear l code
- handle user already in game f.b
- fix preferences update chekc if f : b
- feat: game invite f.b
- add xp and level after winning game b
- smooth paddle movements f.b
- add toast on unexpected errors f
- change ball colors f
- fix achievement b
- try building frontend b
- currently after making backend changes during game , of course taking back to matchmaking - which connects in a healthy way and a game is created (```created 1 matches```) print messagge yet, the gamewebsocket doesnt get created  ff




- check error: 
```Application instance <Task pending name='Task-39' coro=<ASGIStaticFilesHandler.__call__() running at /Users/ouaarabe/Desktop/ft_transcendence/backend/venv/lib/python3.9/site-packages/django/contrib/staticfiles/handlers.py:101> wait_for=<Future pending cb=[<TaskWakeupMethWrapper object at 0x10cf71580>()]>> for connection <WebSocketProtocol client=['127.0.0.1', 59770] path=b'/ws/game/137/'> took too long to shut down and was killed.
Application instance <Task pending name='Task-40' coro=<ASGIStaticFilesHandler.__call__() running at /Users/ouaarabe/Desktop/ft_transcendence/backend/venv/lib/python3.9/site-packages/django/contrib/staticfiles/handlers.py:101> wait_for=<Future pending cb=[<TaskWakeupMethWrapper object at 0x10d0833d0>()]>> for connection <WebSocketProtocol client=['127.0.0.1', 59772] path=b'/ws/game/137/'> took too long to shut down and was killed.
```



```The error message indicates that the application instances handling WebSocket connections took too long to shut down and were killed. This can happen due to various reasons, such as long-running tasks or blocking operations in your code.

To address this, you can try the following steps:

Optimize Long-Running Tasks: Ensure that any long-running tasks are optimized and do not block the main event loop. Consider using asynchronous functions or background tasks for heavy computations.

Increase Timeout: Increase the timeout settings for shutting down the application instances. This can be done in your ASGI server configuration.

Check for Deadlocks: Ensure there are no deadlocks or infinite loops in your code that could cause the shutdown process to hang.

Logging: Add more logging to identify where the shutdown process is getting stuck.



Additionally, ensure that your game_logic.py code is not blocking the event loop. If you have any blocking operations, consider using asyncio to run them asynchronously.```
