import { Request, Response } from 'express'
import { SuccessResponse, FailureResponse, InternalErrorResponse } from './../lib/responseForm'
import FAILURE_RESPONSE from '../lib/failureResponse';
import models from '../models'
import Message from 'src/ts/Message'

const MessageDB = models.message

export const Create = async (req: Request, res: Response) => {
  try {
    const user = req.user!
    const { _id: me } = user
    const { recvAccountId, content, originalId } = req.body

    if (!recvAccountId || recvAccountId.length !== 24 || !content || (originalId && originalId.length !== 24)) {
      return res.status(400).send(FailureResponse(FAILURE_RESPONSE.INVALID_PARAM))
    }

    await MessageDB.Create({ recvAccountId, sendAccountId: me, content, originalId })

    res.send(SuccessResponse())
  }
  catch (err) {
    console.log(err)
    res.status(500).send(InternalErrorResponse)
  }
}

export const GetReceiveMessageList = async (req: Request, res: Response) => {
  try {
    const user = req.user!
    const { _id: me } = user
    let { offset, limit } = req.query

    offset = isNaN(offset) ? 0 : Number(offset)
    limit = isNaN(limit) ? 50 : Number(limit)

    const messages = await MessageDB.GetList({ recvAccountId: me }, { skip: limit * offset, limit })

    res.send(SuccessResponse(messages))
  }
  catch (err) {
    console.log(err)
    res.status(500).send(InternalErrorResponse)
  }
}

export const GetSendMessageList = async (req: Request, res: Response) => {
  try {
    const user = req.user!
    const { _id: me } = user
    let { offset, limit } = req.query

    offset = isNaN(offset) ? 0 : Number(offset)
    limit = isNaN(limit) ? 50 : Number(limit)

    const messages = await MessageDB.GetList({ sendAccountId: me }, { skip: limit * offset, limit })

    res.send(SuccessResponse(messages))
  }
  catch (err) {
    console.log(err)
    res.status(500).send(InternalErrorResponse)
  }
}

export const UpdateIsRead = async (req: Request, res: Response) => {
  try {
    const user = req.user!
    const { _id: me } = user
    const { id } = req.params

    if (!id || id.length !== 24) {
      return res.status(400).send(FailureResponse(FAILURE_RESPONSE.INVALID_PARAM))
    }
    
    await MessageDB.UpdateIsReaded({ _id: id, recvAccountId: me })
    
    res.send(SuccessResponse())
  }
  catch (err) {
    console.log(err)
    res.status(500).send(InternalErrorResponse)
  }
}

export const DeleteList = async (req: Request, res: Response) => {
  try {
    const user = req.user!
    const { _id: me } = user
    const { ids } = req.query

    let isValid = true
    const messageIdList = String(ids).split('')

    messageIdList.map((id: string) => { if (!id || id.length !== 24) isValid = false })

    if (!messageIdList.length || isValid) {
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
    const user = req.user!
    const { _id: me } = user
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
