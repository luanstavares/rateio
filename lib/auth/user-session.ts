export interface UserSession {
    userId: string;
    email: string;
    name: string | null;
    pictureUrl: string | null;
    preferredLocale: string;
}

export const userSessionQueryKey = ["user-session"] as const;
