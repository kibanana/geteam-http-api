import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { SuccessResponse, FailureResponse, InternalErrorResponse } from '@common/lib/response'
import { FAILURE_RESPONSE } from '@common/lib/failureResponse'
import { CategoryType, EmailType, KindType } from '@common/constants'
import BoardGetItemRes from '@common/interfaces/boardItemResponse'
import { JwtPayload, OrderOption } from '@common/interfaces'
import { redisClient } from '@common/lib/redisClient'
import { validateKind, validateCategory, validateModifyOrder } from '@common/lib/validateValue'
import sendEmail from '@mails/index'
import ApplicationDB from '@models/application'
import BoardDB from '@models/board'
import TeamDB from '@models/team'
import config from '../../../config'

export const GetList = async (req: Request, res: Response) => {
    try {
        let { kind, category } = req.params
        let { searchText, offset, limit, order } = req.query
    
        searchText = searchText as string
        kind = validateKind(kind) || KindType.All
        category = validateCategory(kind, category) || CategoryType.Etc
        const offsetNumber = isNaN(Number(offset)) ? 0 : Number(offset)
        const limitNumber = isNaN(Number(limit)) ? 12 : Number(limit)
        const orderOption = validateModifyOrder(order as string) as OrderOption

        let me = undefined
        let payload = undefined
        try {
            const accessToken = (req.header('Authorization') || '').replace('Bearer ', '')
            payload = jwt.verify(accessToken, config.JWT_SECRET, { issuer: config.JWT_ISSUER }) as JwtPayload
            me = payload._id
        }
        catch (err) {}
    
        const result = await BoardDB.GetList(
            { kind, category, author: me },
            { skip: limitNumber * offsetNumber, limit: limitNumber, order: orderOption, searchText }
        )
        
        res.send(SuccessResponse(result))
    }
    catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}

export const GetItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
    
        if (!id || id.length !== 24) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.INVALID_PARAM))
        }
        
        let me = undefined
        let payload = undefined
        try {
            const accessToken = (req.header('Authorization') || '').replace('Bearer ', '')
            payload = jwt.verify(accessToken, config.JWT_SECRET, { issuer: config.JWT_ISSUER }) as JwtPayload
            me = payload._id
        }
        catch (err) {}

        const board = await BoardDB.GetItem({ _id: id })
        if (!board) {
            return res.status(404).send(FailureResponse(FAILURE_RESPONSE.NOT_FOUND))
        }
    
        await BoardDB.UpdateHit({ _id: id, diff: 1 })

        const data: BoardGetItemRes = { board }
        if (me) {
            data.isApplied = await ApplicationDB.IsApplied({ applicant: me, boardId: id })
            data.isAccepted = await ApplicationDB.IsAccepted({ applicant: me, boardId: id })
        }

        res.send(SuccessResponse(data))
    } catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}

export const Create = async (req: Request, res: Response) => {
    try {
        const { _id: me } = req.user!
        const {
            kind,
            category,
            topic,
            title,
            content,
            positions,
            wantCnt,
            endDate
        } = req.body

        const validatedKind = validateKind(kind)
        const validatedCategory = validateKind(category)

        if (
            !kind || !category || !topic || !title || !content || isNaN(wantCnt) || isNaN(Date.parse(endDate)) ||
            (positions && !Array.isArray(positions)) ||
            !validatedKind ||
            !validatedCategory
        ) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.INVALID_PARAM))
        }
    
        const countBoardByMe = await BoardDB.GetBoardCount({ author: me })
        if (countBoardByMe > 3) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.EXCCED_LIMIT))
        }
    
        const result = await BoardDB.Create({
            author: me,
            kind,
            category,
            topic,
            title,
            content,
            positions,
            wantCnt,
            endDate
        })
    
        await redisClient.incCnt('listCnt')
    
        res.status(201).send(SuccessResponse(result.insertedId))
    } catch (err) {
        res.status(500).send(InternalErrorResponse)
    }
}

export const Update = async (req: Request, res: Response) => {
    try {
        const { _id: me } = req.user!
        const { id } = req.params
        const {
            kind,
            category,
            topic,
            title,
            content,
            positions,
            wantCnt,
            endDate
        } = req.body

        const validatedKind = validateKind(kind)
        const validatedCategory = validateKind(category)
    
        if (
            (!id || id.length !== 24) ||
            !kind || !category || !topic || !title || !content || isNaN(wantCnt) || isNaN(Date.parse(endDate)) ||
            (positions && !Array.isArray(positions)) ||
            !validatedKind ||
            !validatedCategory
        ) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.INVALID_PARAM))
        }

        const result = await BoardDB.UpdateItem({
            _id: id,
            author: me,
            kind,
            category,
            topic,
            title,
            content,
            positions,
            wantCnt,
            endDate
        })
        if (result.matchedCount === 0) {
            return res.status(404).send(FAILURE_RESPONSE.NOT_FOUND)
        }

        res.send(SuccessResponse())
    } catch (err) {
        res.status(500).send(InternalErrorResponse)
    }
}

export const Delete = async (req: Request, res: Response) => {
    try {
        const { _id: me } = req.user!
        const { id } = req.params
    
        if (!id || id.length !== 24) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.INVALID_PARAM))
        }
        
        await BoardDB.Delete({ _id: id, author: me })
    
        res.send(SuccessResponse())
    } catch (err) {
        res.status(500).send(InternalErrorResponse)
    }
}

export const CreateTeam = async (req: Request, res: Response) => {
    try {
        const { _id: me } = req.user!
        const { id } = req.params
        const { name, content, message } = req.body
    
        if ((!id || id.length !== 24) || !name || !content || !message) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.INVALID_PARAM))
        }
    
        const countTeamByMe = await BoardDB.GetTeamCount({ author: me })
        if (countTeamByMe > 2) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.EXCCED_LIMIT))
        }
    
        const board = await BoardDB.GetItem({ _id: id })
        if (!board) {
            return res.status(404).send(FailureResponse(FAILURE_RESPONSE.NOT_FOUND))
        }
    
        if (me !== board.author || board.isCompleted) {
            return res.status(400).send(FailureResponse(FAILURE_RESPONSE.BAD_REQUEST))
        }
    
        await BoardDB.UpdateIsCompleted({ _id: id })

        const result = await ApplicationDB.GetList({ author: me, active: true, boardId: id })
        const { list } = result

        await TeamDB.Create({ name, master: me, members: list, content })
        
        await redisClient.incCnt('teamCnt')

        for (let i = 0; i < list.length; i++) {
            sendEmail(EmailType.TeamCompleted, {
                email: list[i].applicant,
                kind: board.kind,
                boardTitle: board.title,
                boardId: board._id,
                boardAuthor: board.author,
            })
            .catch((err: Error) => console.log(err))
        }
        
        res.send(SuccessResponse())
    }
    catch (err) {
        console.log(err)
        res.status(500).send(InternalErrorResponse)
    }
}