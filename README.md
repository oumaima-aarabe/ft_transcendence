# ft_transcendence

## Web Application Functions

- **Live Pong Game**: Play a classic Pong game directly on the website.
- **Remote Players**: Compete against remote opponents via the internet.
- **Tournament System**: Organize and display tournament matchups and player order.
- **User Registration & Management**: Register, log in, update information, and manage profiles.
- **Matchmaking System**: Automatically pair players for matches and announce upcoming games.
- **Game Customization**: Customize the Pong game experience with various options.
- **Live Chat**: Direct messaging between users, including game invites and blocking options.
- **Two-Factor Authentication (2FA)**: Enhance security with an additional verification layer.
- **Multi-Language Support**: Access the application in multiple languages.
- **Responsive Design**: Adapt to various device screens, including desktops, tablets, and smartphones.
- **Cross-Browser Compatibility**: Consistent experience across different web browsers.
- **Server-Side Pong**: Manage the core Pong game server-side for smooth gameplay and API access.

## Minimal Technical Requirements

- **Single-Page Application**: Functions as a single-page application with browser navigation.
- **Browser Compatibility**: Compatible with the latest stable version of Google Chrome.
- **No Errors/Warnings**: No unhandled errors or warnings during browsing.
- **Single Command Launch**: Everything launched with a single command:  `docker-compose up --build`.

## To Do


**Module Type: Major Modules**

- **Backend**
- **User Management**
- **Remote Authentication**
- **Remote Players**
- **Live Chat**
- **Two-Factor Authentication (2FA) & JWT**
- **Server-Side Pong**

**To Consider (Major)**

- **AI Opponent**
- **ELK (Elasticsearch, Logstash, Kibana)**

**Module Type: Minor Modules**

- **Database**
- **Game Customization Options**
- **Multiple Language Support**
- **Expanding Browser Compatibility**
- **Responsive Design**
- **Server-Side Rendering (SSR)**

**To Consider (Minor)**

- **Monitoring System**
- **User and Game Stats Dashboard**


## To keep in mind:

| **Consideration**                         | **Description**                                                                                                 |
|-------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| **User Authentication & Authorization**   | Users must be signed in for access to protected routes. Integration with OAuth 2.0 and secure session management will be used. |
| **Server-Side Integration**               | Server-Side Rendering (SSR) will be implemented for performance and SEO. The server-side Pong game will synchronize game states between server and client. |
| **Data Consistency**                      | PostgreSQL will be used to ensure data consistency. Implement data validation and sanitization to prevent SQL injections and XSS. |
| **Responsiveness & Compatibility**        | The application must be responsive across devices (desktops, tablets, smartphones) and compatible with multiple browsers. |
| **User Experience**                       | Ensure a smooth and engaging user experience with optimized loading times and performance. |
| **Security**                             | Implement Two-Factor Authentication (2FA), use HTTPS for all connections, and utilize JWT for secure session management. |
| **Form and user input validation**        | Implement validation for forms and any user input, either on the client-side within the base page or on the server-side if a backend is employed. |
