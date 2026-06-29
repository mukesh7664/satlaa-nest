import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({ usernameField: 'email', passReqToCallback: true });
    }

    async validate(req: any, email: string, pass: string): Promise<any> {
        const storeId = req.tenant?.id;
        const customer = await this.authService.validateCustomer(email, pass, storeId);
        if (!customer) {
            throw new UnauthorizedException();
        }
        return customer;
    }
}
