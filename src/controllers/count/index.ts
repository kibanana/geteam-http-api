import { Request, Response } from 'express'
import { SuccessResponse, InternalErrorResponse } from '@common/lib/response'
import { redisClient } from '@common/lib/redisClient'

export const GetCount = async (req: Request, res: Response) => {
    try {
        await redisClient.incCnt('visitCnt')

        const visit = await redisClient.getCnt('visitCnt')
        const account = await redisClient.getCnt('accountCnt')
        const list = await redisClient.getCnt('listCnt')
        const application = await redisClient.getCnt('applicationCnt')
        const team = await redisClient.getCnt('teamCnt')
        
        res.send(SuccessResponse({
            visit,
            account,
            list,
            application,
            team,
        }))
    } catch (err) {
        console.log(err)
        res.status(500).json(InternalErrorResponse)
    }
}