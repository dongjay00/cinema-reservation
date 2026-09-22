import type { Seat } from "./seat";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class BookingDraft {
  readonly showtimeId: string;
  private _seat: Seat | undefined;
  private _customerEmail: string;

  constructor(showtimeId: string) {
    if (showtimeId.trim().length === 0) {
      throw new Error("BookingDraft showtimeId must not be empty");
    }
    this.showtimeId = showtimeId;
    this._customerEmail = "";
  }

  get seat(): Seat | undefined {
    return this._seat;
  }

  get customerEmail(): string {
    return this._customerEmail;
  }

  selectSeat(seat: Seat): void {
    this._seat = seat;
  }

  setCustomerEmail(email: string): void {
    this._customerEmail = email.trim();
  }

  get isValid(): boolean {
    return this._seat !== undefined && EMAIL_PATTERN.test(this._customerEmail);
  }
}
