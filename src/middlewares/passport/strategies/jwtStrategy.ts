import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt'
import { JwtPayload } from '@common/interfaces'
import AccountDB from '@models/account'
import config from '../../../../config'

export default new JWTStrategy(
	{
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: config.JWT_SECRET,
        issuer: config.JWT_ISSUER
    }, (async (payload: JwtPayload, done) => {
        try {
            const doesExist = await AccountDB.DoesExist({ _id: payload._id })

            if (!doesExist) done(null, false)
            else done(null, { _id: payload._id })
        }
        catch (err) {
            done(null, { error: err })
        }
    })
)
