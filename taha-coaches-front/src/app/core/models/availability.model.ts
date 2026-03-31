export interface Availability {
    id: string;
    date: string;           // 'YYYY-MM-DD'
    startTime: string;      // 'HH:mm:ss'
    endTime: string;
    isActive: boolean;
}

export interface CreateAvailabilityDto {
    date: string;
    startTime: string;
    endTime: string;
}
