package com.coaching.taha_coaches.domain.slot;

/**
 * Represents the lifecycle state of a generated time slot.
 *
 * FREE    → Available for a client to reserve.
 * BLOCKED → Not available. Set either manually by the admin (individual slot block),
 *           or automatically when the parent Availability window is deactivated.
 *           Blocked slots will be freed again if the parent Availability is re-activated,
 *           UNLESS they were manually blocked before the availability was deactivated
 *           (see SlotService.blockAllForAvailability for the exact rule).
 * BOOKED  → A confirmed reservation exists for this slot.
 *           BOOKED slots are never touched automatically — only the reservation cancel
 *           flow can move a BOOKED slot back to FREE.
 */
public enum SlotStatus {
    FREE,
    BLOCKED,
    BOOKED
}