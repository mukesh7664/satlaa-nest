import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({ usernameField: 'email' });
    }

    async validate(email: string, pass: string): Promise<any> {
        const customer = await this.authService.validateCustomer(email, pass);
        if (!customer) {
            throw new UnauthorizedException();
        }
        return customer;
    }
}
