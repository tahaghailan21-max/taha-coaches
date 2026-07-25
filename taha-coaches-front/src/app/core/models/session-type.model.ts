export interface SessionType {
  id:              string;
  code:            'QUICK_CALL' | 'QUICK_SESSION' | 'NORMAL_SESSION';
  durationMinutes: number;
  sortOrder:       number;
  active:          boolean;
}
