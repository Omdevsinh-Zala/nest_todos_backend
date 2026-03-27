import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException('Authentication token is missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      // Assign the payload to the request object so route handlers can access it
      request['user'] = { ...payload, token: token };
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired authentication token',
      );
    }

    return true;
  }

  private extractTokenFromRequest(request: Request): string | undefined {
    // Check if there is an access_token cookie
    if (request.cookies && request.cookies['access_token']) {
      return request.cookies['access_token'];
    }

    // Fallback manual parse for cookies if cookie-parser is not used
    const cookieHeader = request.headers.cookie;
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce(
        (acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        },
        {} as Record<string, string>,
      );
      if (cookies['access_token']) {
        return cookies['access_token'];
      }
    }

    // Fallback to Bearer token in Authorization header
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
