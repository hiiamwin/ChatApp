export class ErrorResponse {
  status: number;
  message: string;
  errors: Record<string, string>;

  constructor(status: number, message: string, errors: Record<string, string>) {
    this.status = status;
    this.message = message;
    this.errors = errors;
  }
}
