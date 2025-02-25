export interface User {
    id: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar: string;
    cover: string;
    level: number;
    status: "online" | "offline" | "donotdisturb" | "invisible";
    tfa: boolean
}