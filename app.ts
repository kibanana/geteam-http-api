import express from 'express'
import passport from 'passport'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import connectRedis from 'connect-redis'
import morgan from 'morgan'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import config from '@config'
import redisClient from '@common/lib/redisClient'
import '@models/connection'
import router from '@routes'

const app = express()

const RedisStore = connectRedis(session)
app.use(session({
    secret: process.env.SESSION_SECRET || config.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 24000 * 60 * 60, // 쿠키 유효기간 24시간
    },
    store: new RedisStore({
        client: redisClient.client,
        host: '127.0.0.1',
        port: 6379,
        logErrors: true,
    }),
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(passport.initialize())
app.use(passport.session())

app.use(cors())

app.use(morgan('dev'))

app.use('/api', router)

const port = process.env.PORT || config.PORT
app.listen(port, () => {
    console.log(`Server is running on ${port}!`)
})