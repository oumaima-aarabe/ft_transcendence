# ft_transcendence

## Web Application Functions
- **Live Pong Game**: Users can play a classic Pong game directly on the website.
- **Remote Players**: Allows players to compete against remote opponents via the internet.
- **Tournament System**: Organizes and displays tournament matchups and player order.
- **User Registration & Management**: Users can register, log in, update their information, and manage their profiles.
- **Matchmaking System**: Automatically pairs players for matches and announces upcoming games.
- **Game Customization**: Users can customize their Pong game experience with various options.
- **Live Chat**: Facilitates direct messaging between users, including game invites and blocking options.
- **Two-Factor Authentication (2FA)**: Enhances security with an additional layer of verification.
- **Multi-language Support**: The application is accessible in multiple languages.
- **Responsive Design**: The website adapts to various device screens, including desktops, tablets, and smartphones.
- **Cross-Browser Compatibility**: Ensures a consistent experience across different web browsers.
- **Server-Side Pong**: The core Pong game is managed server-side, providing smooth gameplay and easy API access.

## Minimal Technical Requirements
- **Single-Page Application**: The website functions as a single-page application, utilizing the browser's Back and Forward buttons.
- **Browser Compatibility**: The application is compatible with the latest stable version of Google Chrome.
- **No Errors/Warnings**: The website should have no unhandled errors or warnings during browsing.
- **Single Command Launch**: Everything is launched with a single command, e.g., `docker-compose up --build`.

## To do
| **Module Type**           | **Module**                                |
|---------------------------|-------------------------------------------|
| **Major Modules**         | Backend                                   |
|                           | User Management                           |
|                           | Remote Authentication                     |
|                           | Remote Players                            |
|                           | Live Chat                                 |
|                           | Two-Factor Authentication (2FA) & JWT     |
|                           | Server-Side Pong                          |
| **To Consider (Major)**   | AI Opponent                               |
|                           | ELK (Elasticsearch, Logstash, Kibana)     |
| **Minor Modules**         | Database                                  |
|                           | Game Customization Options                |
|                           | Multiple Language Support                 |
|                           | Expanding Browser Compatibility           |
|                           | Responsive Design                         |
|                           | Server-Side Rendering (SSR)               |
| **To Consider (Minor)**   | Monitoring System                         |
|                           | User and Game Stats Dashboard             |


## To consider:

| **Consideration**                         | **Description**                                                                                                 |
|-------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| **User Authentication & Authorization**   | Users must be signed in for access to protected routes. Integration with OAuth 2.0 and secure session management will be used. |
| **Server-Side Integration**               | Server-Side Rendering (SSR) will be implemented for performance and SEO. The server-side Pong game will synchronize game states between server and client. |
| **Data Consistency**                      | PostgreSQL will be used to ensure data consistency. Implement data validation and sanitization to prevent SQL injections and XSS. |
| **Responsiveness & Compatibility**        | The application must be responsive across devices (desktops, tablets, smartphones) and compatible with multiple browsers. |
| **User Experience**                       | Ensure a smooth and engaging user experience with optimized loading times and performance. |
| **Security**                             | Implement Two-Factor Authentication (2FA), use HTTPS for all connections, and utilize JWT for secure session management. |




