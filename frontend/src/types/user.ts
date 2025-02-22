export enum UserState {
    ONLINE,
    OFFLINE,
}

export type User = {
    email: string
    username: string
    password: string
    avatar: string
    first_name: string
    last_name: string
    level: number
    state: UserState
    tfa: boolean
}