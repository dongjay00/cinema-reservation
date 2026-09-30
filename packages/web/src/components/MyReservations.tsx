import { useState } from "react";
import type { Reservation } from "../domain/reservation";

interface MyReservationsProps {
  load: (email: string) => Promise<Reservation[]>;
  onCancel: (id: string) => Promise<void>;
}

export function MyReservations({ load, onCancel }: MyReservationsProps) {
  const [email, setEmail] = useState("");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  const handleSearch = async () => {
    setBusy(true);
    setError(undefined);
    try {
      setReservations(await load(email));
    } catch (err) {
      setError(err instanceof Error ? err.message : "조회에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async (id: string) => {
    setBusy(true);
    setError(undefined);
    try {
      await onCancel(id);
      setReservations(await load(email));
    } catch (err) {
      setError(err instanceof Error ? err.message : "취소에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section style={{ marginTop: 32 }}>
      <h2>내 예약</h2>
      <div>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="이메일"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={busy || email.trim() === ""}
        >
          조회
        </button>
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {reservations.length === 0 ? (
        <p>예약이 없습니다.</p>
      ) : (
        <ul>
          {reservations.map((reservation) => (
            <li key={reservation.id}>
              {reservation.seat.label} / {reservation.id} / {reservation.status}
              {reservation.status === "CONFIRMED" && (
                <button
                  type="button"
                  onClick={() => handleCancel(reservation.id)}
                  disabled={busy}
                >
                  취소
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
