interface BookingFormProps {
  email: string;
  onEmailChange: (email: string) => void;
  canSubmit: boolean;
  submitting: boolean;
  onSubmit: () => void;
}

export function BookingForm({
  email,
  onEmailChange,
  canSubmit,
  submitting,
  onSubmit,
}: BookingFormProps) {
  return (
    <div style={{ marginTop: 16 }}>
      <input
        type="email"
        value={email}
        placeholder="예약자 이메일"
        onChange={(e) => onEmailChange(e.target.value)}
      />
      <button
        type="button"
        disabled={!canSubmit || submitting}
        onClick={onSubmit}
      >
        {submitting ? "예약 중..." : "예약하기"}
      </button>
    </div>
  );
}
