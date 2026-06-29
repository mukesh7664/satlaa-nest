import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Store } from '../../stores/entities/store.entity';

export const CurrentTenant = createParamDecorator(
    (data: keyof Store | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const tenant: Store = request.tenant;

        if (!tenant) {
            return null; // or throw an error depending on your strictness
        }

        return data ? tenant[data] : tenant;
    },
);
