import { ProgramError } from '@project-serum/anchor';

export class CreateEventError extends Error {
  name = 'CreateEventError';
}

export class CreateWearableError extends Error {
  name = 'CreateWearableError';
}

export interface ApiError {
  code: number;
  message: string;
  type: CreateEventError | CreateWearableError;
}

export type ApiErrorType = CreateEventError | CreateWearableError;

export class ApiError implements ApiError {
  constructor(error: ProgramError, err: ApiErrorType) {
    this.code = error.code;
    this.message = error.message;
    this.type = err;
  }
}
