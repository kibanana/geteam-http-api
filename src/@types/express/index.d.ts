import { JwtPayload } from '@common/interfaces';

declare module 'express' {
    export interface Request  {
        user: JwtPayload
    }
}
