import JwtPayload from '@common/interfaces/jwtPayload';

declare module 'express' {
    export interface Request  {
        user: JwtPayload
    }
}
