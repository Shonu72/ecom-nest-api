import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * JwtStrategy is responsible for validating the Access Token.
 * It automatically extracts the token from the Authorization header.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Using getOrThrow to ensure the secret exists at runtime
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  /**
   * Called after the token is verified.
   * Attach non-sensitive payload data to the request.
   */
  async validate(payload: any) {
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role, // required by RolesGuard
    };
  }
}