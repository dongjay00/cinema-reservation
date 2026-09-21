import { useMemo, useState } from "react";
import { BookingDraft } from "./domain/booking-draft";
import type { Seat } from "./domain/seat";
import type { Reservation } from "./domain/reservation";
import { ReserveSeatUseCase } from "./application/use-cases/reserve-seat";
import { HttpReservationRepository } from "./infrastructure/http/booking-repository";
import { DuplicateSeatError } from "./application/errors";
import { SeatPicker } from "./components/SeatPicker";
import { BookingForm } from "./components/BookingForm";

const reserveSeat = new ReserveSeatUseCase(new HttpReservationRepository("http://localhost:4000"));

export default function App() {
  const [seat, setSeat] = useState<Seat | undefined>();
  const [email, setEmail] = useState("");
  const [reservation, setReservation] = useState<Reservation | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const draft = useMemo(() => {
    const d = new BookingDraft("showtime-1");
    if (seat) d.selectSeat(seat);
    d.setCustomerEmail(email);
    return d;
  }, [seat, email]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(undefined);
    try {
      setReservation(await reserveSeat.execute(draft));
    } catch (err) {
      if (err instanceof DuplicateSeatError) {
        setError("이미 예약된 좌석입니다. 다른 좌석을 선택하세요.");
      } else {
        setError(err instanceof Error ? err.message : "예약에 실패했습니다.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>영화관 좌석 예매</h1>

      <SeatPicker selected={seat} onSelect={setSeat} />

      <BookingForm
        email={email}
        onEmailChange={setEmail}
        canSubmit={draft.isValid && !submitting}
        submitting={submitting}
        onSubmit={handleSubmit}
      />

      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {reservation && (
        <p style={{ color: "green" }}>
          예약 완료: {reservation.seat.label} / {reservation.id} / {reservation.status}
        </p>
      )}
    </main>
  );
}