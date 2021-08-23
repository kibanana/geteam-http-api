import { connect } from 'mongoose'
import config from '@config'

export default connect(
        process.env.DB_URL || config.DB_URL,
        {
            useCreateIndex: true,
            useNewUrlParser: true,
            autoReconnect: true,
            reconnectTries: Number.MAX_VALUE,
        }
    )
    .then((connection: any) => {
        console.log('Mongodb connected')
        return connection
    })
    .catch((err: any) => {
        console.log('Mongodb not connected')
        console.log(err)
    })
