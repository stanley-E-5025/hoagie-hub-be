import { BadRequestException } from '@nestjs/common';

export class ValidationException extends BadRequestException {
  constructor(message: string = 'Validation failed', errors?: any) {
    super({
      message,
      error: 'Validation Error',
      errors,
    });
  }
}
