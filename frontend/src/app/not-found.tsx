'use client';

import Link from 'next/link';
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function NotFound() {
  return (
    <html>
      <head>
        <title>404 - Page Not Found</title>
        <link rel="icon" href="/favicon.ico" />
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            margin: 0;
            padding: 0;
            font-family: system-ui, -apple-system, sans-serif;
          }
          .container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background-image: url(/assets/images/background.jpg);
            background-size: cover;
            background-position: center;
          }
          .content {
            background-color: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(8px);
            padding: 40px;
            border-radius: 16px;
            text-align: center;
            max-width: 500px;
            margin: 0 16px;
          }
          .error-code {
            font-size: 6rem;
            font-weight: bold;
            color: #D05F3B;
            margin-bottom: 24px;
            text-shadow: 0 0 10px rgba(255, 102, 0, 0.7);
          }
          .title {
            font-size: 2.5rem;
            font-weight: bold;
            color: white;
            margin-bottom: 16px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }
          .message {
            font-size: 1.2rem;
            color: white;
            margin-bottom: 32px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          }
          .button {
            display: inline-block;
            background-color: #40CFB7;
            color: #c75b37;
            border: 1px solid;
            font-size: 1.25rem;
            padding: 16px 32px;
            border-radius: 9999px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-decoration: none;
            transition: background-color 0.3s ease;
          }
          .button:hover {
            background-color: #EEE5BE;
          }
        `}} />
      </head>
      <body>
        <div className="container">
          <div className="content">
            <div className="error-code">404</div>
            <h1 className="title">Page Not Found</h1>
            <p className="message">The page you are looking for doesn't exist or has been moved.</p>
            <a href="/" className="button">Back to Home</a>
          </div>
        </div>
      </body>
    </html>
  );
} 