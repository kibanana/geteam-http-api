
import { connection } from 'mongoose'
import { ObjectId } from 'mongodb'
import { entities } from '@common/constants'
import { Option } from '@common/interfaces'
import {
    Application,
    ContestApplication
} from '@models/entities'
import { Filter } from './interfaces'

const applicationColl = connection.collection(entities.APPLICATION)
const boardColl = connection.collection(entities.BOARD)

export default {
    Create: (params: {
        applicantId: string,
        authorId: string,
        boardId: string | ObjectId,
        wantedText: string,
        position?: string,
        portfolio?: string,
        portfolioText?: string
    }) => {
        const { applicantId, authorId, boardId, wantedText, position, portfolio, portfolioText } = params

        const contestObj: Partial<ContestApplication> = {}
        if (position) contestObj.position = position
        if (portfolio) contestObj.portfolio = portfolio
        if (portfolioText) contestObj.portfolioText = portfolioText

        return applicationColl.insertOne({
            applicantId: new ObjectId(applicantId),
            authorId: new ObjectId(authorId),
            boardId: new ObjectId(boardId),
            wantedText,
            ...contestObj,
            active: true,
            createdAt: new Date(),
            updatedAt: new Date()
        })
    },
    GetList: async (
        params: {
            applicantId?: string,
            kind?: string,
            authorId?: string,
            isAccepted?: boolean,
            active?: boolean,
            boardId?: string
        },
        options: Option = {}
    ) => {
        const { applicantId, kind, authorId, isAccepted, active, boardId } = params
        const { skip, limit, status } = options

        const filter: Partial<Filter> = {}
        if (isAccepted) filter.isAccepted = isAccepted
        if (active) filter.active = active
        if (boardId) filter.boardId = new ObjectId(boardId)

        switch (status) {
            case 'applied':
                if (authorId) filter.authorId = new ObjectId(authorId)
                break
            case 'accepted':
            case 'unaccpeted':
                if (applicantId) filter.applicantId = new ObjectId(applicantId)
                break
            default:
                break
        }

        if (kind && kind !== 'all') {
            let boardIds = undefined
            let listByKind = undefined

            if (filter.authorId) {
                listByKind = await boardColl.find(
                    { authorId: new ObjectId(filter.authorId), kind },
                    { projection: { _id: true } }
                ).toArray()

                filter.boardId = listByKind.map(board => new ObjectId(board._id))
            }

            if (filter.applicantId) {
                boardIds = await applicationColl.find(
                    { applicantId: new ObjectId(filter.applicantId) },
                    { projection: { boardId: true } }
                ).toArray()

                listByKind = await boardColl.find(
                    { _id: boardIds.map(board => new ObjectId(board._id)), kind },
                    { projection: { _id: true } }
                ).toArray()

                filter.boardId = listByKind.map(board => new ObjectId(board._id))
            }
        }

        const list: Application[]  = await applicationColl.find(filter, { skip, limit, sort: { createdAt: -1 } }).toArray()
        const count = await applicationColl.countDocuments(filter)

        return { list, count }
    },
    IsApplied: async (params: { applicantId: string, boardId: string }) => {
        const { applicantId, boardId } = params

        return (await applicationColl.countDocuments({
            applicantId: new ObjectId(applicantId),
            boardId: new ObjectId(boardId),
            active: true
        })) > 0
    },
    IsAccepted: async (params: { applicantId: string, boardId: string }) => {
        const { applicantId, boardId } = params

        return (await applicationColl.countDocuments({
            applicantId: new ObjectId(applicantId),
            boardId: new ObjectId(boardId),
            isAccepted: true
        })) > 0
    },
    UpdateIsAccepted: (params: { _id: string, boardId: string, authorId: string }) => {
        const { _id, boardId, authorId } = params
        
        return applicationColl.updateOne(
            { _id: new ObjectId(_id), boardId: new ObjectId(boardId), authorId: new ObjectId(authorId) },
            { $set: { isAccepted: true, updatedAt: new Date() }
        })
    },
    Delete: async (params: { _id: string, boardId: string, authorId: string }) => {
        const { _id, boardId, authorId } = params

        const boardCount = (await boardColl.countDocuments({
            _id: new ObjectId(boardId),
            authorId: new ObjectId(authorId),
            $or: [
                { endDate: { $lte: new Date() } },
                { active: true }
            ]
        })) > 0
        const applicationCount = (await applicationColl.countDocuments({
            _id: new ObjectId(_id),
            boardId: new ObjectId(boardId)
        })) > 0
        
        if (boardCount || applicationCount) return false
        
        return await applicationColl.updateOne(
            { _id: new ObjectId(_id) },
            { $set: { active: false } }
        )
    }
}
