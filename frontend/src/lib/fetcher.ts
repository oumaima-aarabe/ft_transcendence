import axios from "axios";

export const fetcher = axios.create({
    withCredentials: true,
    // baseURL: process.env.BACKEND_API_URL,
    baseURL :"http://localhost:8000",
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    }
})