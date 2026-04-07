export type Role = 'admin' | 'user' | 'manager'

export type User = {
    id: number;
    telegram_id: string;
    username: string;
    role: Role;
}