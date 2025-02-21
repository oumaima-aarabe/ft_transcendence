export enum UserState {
    ONLINE,
    OFFLINE,
}

export type User = {
    email: string
    username: string
    password: string
    avatar: string
    firstname: string
    lastname: string
    level: number
    state: UserState
    tfa: boolean
}