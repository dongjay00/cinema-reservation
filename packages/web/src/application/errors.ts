export class DuplicateSeatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateSeatError";
  }
}