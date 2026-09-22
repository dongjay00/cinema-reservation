export class Seat {
  readonly row: string;
  readonly number: number;

  constructor(row: string, number: number) {
    const trimmed = row.trim();
    if (trimmed.length === 0) {
      throw new Error("Seat row must not be empty");
    }
    if (!Number.isInteger(number) || number <= 0) {
      throw new Error("Seat number must be a positive integer");
    }

    this.row = trimmed.toUpperCase();
    this.number = number;
  }

  get label(): string {
    return `${this.row}-${this.number}`;
  }

  equals(other: Seat): boolean {
    return this.row === other.row && this.number === other.number;
  }
}
