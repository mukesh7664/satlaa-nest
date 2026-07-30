import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override handleRequest to not throw an exception if authentication fails
  handleRequest(err: any, user: any, info: any) {
    if (user) {
      return user;
    }
    // Return null or undefined instead of throwing UnauthorizedException
    return null;
  }
}
