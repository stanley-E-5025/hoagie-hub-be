import { ForbiddenException } from '@nestjs/common';

export class PermissionDeniedException extends ForbiddenException {
  constructor(
    message: string = 'You do not have permission to perform this action',
  ) {
    super({
      message,
      error: 'Permission Denied',
    });
  }
}
