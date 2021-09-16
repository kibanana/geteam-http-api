import passport from 'passport'
import { JwtPayload } from '@common/interfaces'
import JwtStratery from './strategies/jwtStrategy'

passport.use('jwt', JwtStratery)

passport.serializeUser((account, done) => done(null, account))
passport.deserializeUser((account: JwtPayload, done) => done(null, account))

export default passport
