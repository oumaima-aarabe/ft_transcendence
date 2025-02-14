// pages/auth/callback.tsx or app/auth/callback/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
export default function AuthCallback() {
    const router = useRouter();
    const searcParams = useSearchParams();

    const code = searcParams.get('code');

    useEffect(() => {
        if (code) {
            // Send the code to your backend
            axios.get(`http://localhost:8000/api/auth/42/callback?code=${code}`)
            .then(data => {
                // Handle successful login (e.g., save token, redirect)
                console.log('Login success:', data);
                // router.push('/dashboard');
            })
            .catch(error => {
                console.error('Login error:', error);
            });
        }
    }, [code]);

    return <div>Loading...</div>;
}