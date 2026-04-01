// availability.model.ts
export interface Availability {
  id: string;
  date: string;        // 'YYYY-MM-DD'
  startTime: string;   // 'HH:mm:ss'
  endTime: string;     // 'HH:mm:ss'
  isActive: boolean;   // now matches @JsonProperty("isActive") on backend
  createdAt?: string;
}

export interface CreateAvailabilityDto {
  date: string;
  startTime: string;
  endTime: string;
}
