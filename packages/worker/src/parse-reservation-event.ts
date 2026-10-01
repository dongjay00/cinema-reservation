import type { ReservationEventDto } from "@cinema/shared";

export function parseReservationEvent(payload: string): ReservationEventDto {
  const parsed: unknown = JSON.parse(payload);
  if (isReservationCreated(parsed)) {
    return parsed;
  }
  if (isReservationCancelled(parsed)) {
    return parsed;
  }
  throw new Error("Unknown reservation event payload");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isReservationCreated(
  value: unknown,
): value is Extract<ReservationEventDto, { type: "ReservationCreated" }> {
  if (!isRecord(value)) return false;
  return (
    value.type === "ReservationCreated" &&
    typeof value.reservationId === "string" &&
    typeof value.showtimeId === "string" &&
    typeof value.seatRow === "string" &&
    typeof value.seatNumber === "number" &&
    typeof value.customerEmail === "string"
  );
}

function isReservationCancelled(
  value: unknown,
): value is Extract<ReservationEventDto, { type: "ReservationCancelled" }> {
  if (!isRecord(value)) return false;
  return (
    value.type === "ReservationCancelled" &&
    typeof value.reservationId === "string" &&
    typeof value.showtimeId === "string" &&
    typeof value.customerEmail === "string"
  );
}
