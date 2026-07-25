export interface Reservation {
  id:              string;
  date:            string;        // 'YYYY-MM-DD'
  startTime:       string;        // 'HH:mm:ss'
  endTime:         string;        // 'HH:mm:ss'
  sessionTypeCode: string;
  durationMinutes: number;
  status:          ReservationStatus;
  notes:           string | null;
  userId:          string;
  userName:        string | null;
}

export type ReservationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'DECLINED'
  | 'CANCELLED'
  | 'COMPLETED';

export interface CreateReservationDto {
  date:          string;        // 'YYYY-MM-DD'
  startTime:     string;        // 'HH:mm:ss'
  sessionTypeId: string;
  notes:         string | null;
}

export interface TimeRange {
  startTime: string;  // 'HH:mm:ss'
  endTime:   string;
}
