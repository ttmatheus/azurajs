export class HttpError extends Error {
  status: number;
  payload?: any;
  constructor(status: number, message?: string, payload?: any) {
    super(message ?? String(message ?? "Error"));
    this.status = status;
    this.payload = payload;
  }
}
