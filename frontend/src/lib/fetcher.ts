import axios from "axios";

export const fetcher = axios.create({
    withCredentials: true,
    // baseURL: process.env.BACKEND_API_URL,
    baseURL :process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    }
})