type ConsentStatus = 'accepted' | 'declined'

export type Consent = {
    id: string;
    user__id: number;
    status: ConsentStatus;
    created_at: string;
}