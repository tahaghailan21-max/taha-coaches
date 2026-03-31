export interface Reservation {
    id: string;
    date: string;       // 'YYYY-MM-DD'
    time: string;       // 'HH:mm:ss'
    durationMinutes: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    notes?: string;
}