import { JwtPayload } from '@common/interfaces'

declare namespace Express {
    export interface Request<
        Body = any,
        Query = any,
        Params = any,
        Cookies = any,
    > extends Express.Request {
        body: Body;
        query: Query;
        params: Params;
        cookies: Cookies;
    }
}

declare namespace Express {
    export interface Request  {
        body: {
            user: JwtPayload;
        };
    }
}
