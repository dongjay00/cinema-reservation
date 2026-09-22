import { useEffect, useMemo, useState } from "react";
import type { Showtime } from "./domain/showtime";
import type { Seat } from "./domain/seat";
import type { Reservation } from "./domain/reservation";
import type { SeatAvailability } from "./application/ports/showtime-repository";
import { BookingDraft } from "./domain/booking-draft";
import { ReserveSeatUseCase } from "./application/use-cases/reserve-seat";
import { CancelReservationUseCase } from "./application/use-cases/cancel-reservation";
import { LoadShowtimesUseCase } from "./application/use-cases/load-showtimes";
import { LoadShowtimeSeatsUseCase } from "./application/use-cases/load-showtime-seats";
import { HttpReservationRepository } from "./infrastructure/http/booking-repository";
import { HttpShowtimeRepository } from "./infrastructure/http/showtime-repository";
import { DuplicateSeatError } from "./application/errors";
import { SeatPicker } from "./components/SeatPicker";
import { BookingForm } from "./components/BookingForm";
import { ShowtimeSelector } from "./components/ShowtimeSelector";

const BASE_URL = "http://localhost:4000";

const reserveSeat = new ReserveSeatUseCase(new HttpReservationRepository(BASE_URL));
const cancelReservation = new CancelReservationUseCase(new HttpReservationRepository(BASE_URL));
const loadShowtimes = new LoadShowtimesUseCase(new HttpShowtimeRepository(BASE_URL));
const loadShowtimeSeats = new LoadShowtimeSeatsUseCase(new HttpShowtimeRepository(BASE_URL));

export default function App() {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState("");
  const [seats, setSeats] = useState<SeatAvailability[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | undefined>();
  const [email, setEmail] = useState("");
  const [reservation, setReservation] = useState<Reservation | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadShowtimes.execute().then((list) => {
      setShowtimes(list);
      if (list.length > 0) {
        setSelectedShowtimeId(list[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedShowtimeId) {
      return;
    }
    loadShowtimeSeats.execute(selectedShowtimeId).then((s) => {
      setSeats(s);
      setSelectedSeat(undefined);
    });
  }, [selectedShowtimeId]);

  const draft = useMemo(() => {
    if (!selectedShowtimeId) {
      return undefined;
    }
    const d = new BookingDraft(selectedShowtimeId);
    if (selectedSeat) d.selectSeat(selectedSeat);
    d.setCustomerEmail(email);
    return d;
  }, [selectedShowtimeId, selectedSeat, email]);

  const refreshSeats = () => {
    loadShowtimeSeats.execute(selectedShowtimeId).then(setSeats);
  };

  const handleSubmit = async () => {
    if (!draft) {
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      setReservation(await reserveSeat.execute(draft));
      refreshSeats();
    } catch (err) {
      if (err instanceof DuplicateSeatError) {
        setError("이미 예약된 좌석입니다. 다른 좌석을 선택하세요.");
      } else {
        setError(err instanceof Error ? err.message : "예약에 실패했습니다.");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    if (!reservation) {
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      setReservation(await cancelReservation.execute(reservation.id));
      refreshSeats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "취소에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>영화관 좌석 예매</h1>

      <ShowtimeSelector
        showtimes={showtimes}
        selectedId={selectedShowtimeId}
        onSelect={setSelectedShowtimeId}
      />

      <SeatPicker seats={seats} selected={selectedSeat} onSelect={setSelectedSeat} />

      <BookingForm
        email={email}
        onEmailChange={setEmail}
        canSubmit={(draft?.isValid ?? false) && !busy}
        submitting={busy}
        onSubmit={handleSubmit}
      />

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {reservation && (
        <div>
          <p style={{ color: "green" }}>
            예약: {reservation.seat.label} / {reservation.id} / {reservation.status}
          </p>
          {reservation.status === "CONFIRMED" && (
            <button onClick={handleCancel} disabled={busy}>
              예약 취소
            </button>
          )}
        </div>
      )}
    </main>
  );
}