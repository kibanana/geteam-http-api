import { Request, Response } from 'express'
import { KindType } from '@common/constants'
import {
    FAILURE_RESPONSE,
    SuccessResponse,
    FailureResponse,
    InternalErrorResponse,
    redisClient,
    validateKind
} from '@common/lib'
import ApplicationDB from '@models/application'
import BoardDB from '@models/board'
import { ContestApplication } from '@models/entities/application'

export const GetList = async (req: Request, res: Response) => {
    try {
        const { _id: me } = req.user!
        let { kind, authorId, offset, limit, status } = req.query

        kind = validateKind(kind as string) || KindType.All
        authorId = authorId as string
        status = status as string
        const offsetNumber = isNaN(Number(offset)) ? 0 : Number(offset)
        const limitNumber = isNaN(Number(limit)) ? 12 : Number(limit)
        const isAccepted = req.query.is_accepted === 'true'
        const active = req.query.active === 'true'

        const result = await ApplicationDB.GetList(
            { applicantId: me, kind, authorId, isAccepted, active },
            { skip: offsetNumber * limitNumber, limit: limitNumber, status }
        )

        res.send(SuccessResponse(result))
    }
    catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}

export const GetListOnMyParticularBoard = async (req: Request, res: Response) => {
    try {
        const { _id: me } = req.user!
        let { id: boardId } = req.params
    
        if (!boardId || boardId.length !== 24) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.INVALID_PARAM))
        }
    
        const result = await ApplicationDB.GetList({ authorId: me, boardId })
    
        res.send(SuccessResponse(result))
    }
    catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}

export const Create = async (req: Request, res: Response) => {
    try {
        const { _id: me } = req.user!
        const { boardId, wantedText } = req.body
        let { kind, position, portfolio, portfolioText } = req.body

        if (!boardId || boardId.length !== 24 || !wantedText) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.INVALID_PARAM))
        }
    
        const board = await BoardDB.GetItem({ _id: boardId })
        if (!board) {
            return res.status(404).send(FailureResponse(FAILURE_RESPONSE.NOT_FOUND))
        }
        if (me === String(board.authorId)) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.BAD_REQUEST))
        }

        const isApplied = await ApplicationDB.IsApplied({ applicantId: me, boardId })
        if (isApplied) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.BAD_REQUEST))
        }

        const contestObj: ContestApplication = {}
        kind = validateKind(kind)
        if (kind === KindType.Contest) {
            contestObj.position = position
            contestObj.portfolio = portfolio
            contestObj.portfolioText = portfolioText
        }

        const result = await ApplicationDB.Create({ applicantId: me, authorId: String(board.authorId), boardId, wantedText, ...contestObj })

        await BoardDB.UpdateApplicationCnt({ _id: boardId, diff: 1 })

        await redisClient.incCnt('applicationCnt')
        
        res.status(201).send(SuccessResponse({ _id: result.insertedId }))
    }
    catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}

export const UpdateAccept = async (req: Request, res: Response) => {
    try {
        const { _id: me } = req.user!
        const { id: boardId, applicationid: applicationId } = req.params

        if (!boardId || boardId.length !== 24 || !applicationId || applicationId.length !== 24) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.INVALID_PARAM))
        }

        if (await ApplicationDB.IsAccepted({ applicantId: applicationId, boardId })) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.BAD_REQUEST))
        }

        const updateIsAcceptedResult = await ApplicationDB.UpdateIsAccepted({ _id: applicationId, boardId, authorId: me })
        if (updateIsAcceptedResult.matchedCount === 0) {
            return res.status(404).send(FailureResponse(FAILURE_RESPONSE.NOT_FOUND))
        }
    
        const updateAcceptCntResult = await BoardDB.UpdateAcceptCnt({ _id: boardId, diff: 1 })
        if (updateAcceptCntResult.matchedCount === 0) {
            return res.status(404).send(FailureResponse(FAILURE_RESPONSE.NOT_FOUND))
        }
    
        res.send(SuccessResponse())
    }
    catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    } 
}

export const Delete = async (req: Request, res: Response) => {
    try {
        const { _id: me } = req.user!
        const { id: boardId, applicationid: applicationId } = req.params

        if (!boardId || boardId.length !== 24 || !applicationId || applicationId.length !== 24) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.INVALID_PARAM))
        }

        const result = await ApplicationDB.Delete({ _id: applicationId, boardId, authorId: me })
        if (result === false) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.BAD_REQUEST))
        }
        if (result.matchedCount === 0) {
            return res.status(404).send(FailureResponse(FAILURE_RESPONSE.NOT_FOUND))
        }

        await BoardDB.UpdateApplicationCnt({ _id: boardId, diff: -1 })
        
        res.send(SuccessResponse())
    }
    catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}