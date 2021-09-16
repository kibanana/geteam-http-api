import { Request, Response } from 'express'
import { SuccessResponse, FailureResponse, InternalErrorResponse } from '@common/lib/response'
import { FAILURE_RESPONSE } from '@common/lib/failureResponse'
import MessageDB from '@models/message'

export const Create = async (req: Request, res: Response) => {
    try {
        const { _id: me } = req.user!
        const { recvAccountId, content, originalId } = req.body

        if (
            (originalId && originalId.length !== 24) ||
            (!recvAccountId || recvAccountId.length !== 24) ||
            !content
        ) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.INVALID_PARAM))
        }

        await MessageDB.Create({ originalId, recvAccountId, sendAccountId: me, content })

        res.send(SuccessResponse())
    }
    catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}

export const GetReceiveMessageList = async (req: Request, res: Response) => {
    try {
        const { _id: me } = req.user!
        let { offset, limit } = req.query

        const offsetNumber = isNaN(Number(offset)) ? 0 : Number(offset)
        const limitNumber = isNaN(Number(limit)) ? 50 : Number(limit)

        const messages = await MessageDB.GetList(
            { recvAccountId: me },
            { skip: limitNumber * offsetNumber, limit: limitNumber }
        )

        res.send(SuccessResponse(messages))
    }
    catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}

export const GetSendMessageList = async (req: Request, res: Response) => {
    try {
        const { _id: me } = req.user!
        let { offset, limit } = req.query

        const offsetNumber = isNaN(Number(offset)) ? 0 : Number(offset)
        const limitNumber = isNaN(Number(limit)) ? 50 : Number(limit)

        const messages = await MessageDB.GetList(
            { sendAccountId: me },
            { skip: limitNumber * offsetNumber, limit: limitNumber }
        )

        res.send(SuccessResponse(messages))
    }
    catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}

export const UpdateIsRead = async (req: Request, res: Response) => {
    try {
        const { _id: me } = req.user!
        const { id } = req.params

        if (!id || id.length !== 24) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.INVALID_PARAM))
        }
        
        await MessageDB.UpdateIsRead({ _id: id, recvAccountId: me })
        
        res.send(SuccessResponse())
    }
    catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}

export const DeleteList = async (req: Request, res: Response) => {
    try {
        const { _id: me } = req.user!
        const { ids } = req.query

        let isValid = true
        const messageIdList = String(ids).split('')
        messageIdList.map((id: string) => {
            if (!id || id.length !== 24) isValid = false
        })

        if (messageIdList.length === 0 || !isValid) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.INVALID_PARAM))
        }

        await MessageDB.DeleteList({ ids: messageIdList, accountId: me })
        
        res.send(SuccessResponse())
    }
    catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}

export const DeleteItem = async (req: Request, res: Response) => {
    try {
        const { _id: me } = req.user!
        const { id } = req.params

        if (!id || id.length !== 24) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.INVALID_PARAM))
        }

        await MessageDB.DeleteItem({ _id: id, accountId: me })
        
        res.send(SuccessResponse())
    }
    catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}
