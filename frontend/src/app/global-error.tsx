'use client';

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <title>Error - PongArcadia</title>
      </head>
      <body className={inter.className} style={{ margin: 0, padding: 0 }}>
        {/* Container with background image */}
        <div 
          style={{
            position: 'relative',
            width: '100vw',
            height: '100vh',
            backgroundImage: 'url(/assets/images/background.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Content container */}
          <div 
            style={{
              backgroundColor: 'rgba(0,0,0,0.4)',
              padding: '40px',
              borderRadius: '16px',
              backdropFilter: 'blur(8px)',
              textAlign: 'center',
              maxWidth: '500px'
            }}
          >
            <div 
              style={{
                fontSize: '4rem',
                fontWeight: 'bold',
                color: '#D05F3B',
                marginBottom: '24px',
                textShadow: '0 0 10px rgba(255,102,0,0.7)'
              }}
            >
              Oops!
            </div>
            <h1 
              style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '16px',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              Something went wrong
            </h1>
            <p 
              style={{
                fontSize: '1.2rem',
                color: 'white',
                marginBottom: '32px',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}
            >
              An error occurred while loading this page.
            </p>
            <button
              onClick={() => reset()}
              style={{
                position: 'relative',
                backgroundColor: '#40CFB7',
                color: '#c75b37',
                border: '1px solid',
                fontSize: '1.25rem',
                padding: '16px 32px',
                borderRadius: '9999px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#EEE5BE'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#40CFB7'}
            >
              <span style={{ position: 'relative', zIndex: 1 }}>Try Again</span>
            </button>
          </div>
        </div>
      </body>
    </html>
  );
} 