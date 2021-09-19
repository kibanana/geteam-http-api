
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
        applicant: string,
        author: string,
        boardId: string | ObjectId,
        wantedText: string,
        position?: string,
        portfolio?: string,
        portfolioText?: string
    }) => {
        const { applicant, author, boardId, wantedText, position, portfolio, portfolioText } = params

        const contestObj: Partial<ContestApplication> = {}
        if (position) contestObj.position = position
        if (portfolio) contestObj.portfolio = portfolio
        if (portfolioText) contestObj.portfolioText = portfolioText

        return applicationColl.insertOne({
            applicant: new ObjectId(applicant),
            author: new ObjectId(author),
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
            applicant?: string,
            kind?: string,
            author?: string,
            isAccepted?: boolean,
            active?: boolean,
            boardId?: string
        },
        options: Option = {}
    ) => {
        const { applicant, kind, author, isAccepted, active, boardId } = params
        const { skip, limit, status } = options

        const filter: Partial<Filter> = {}
        if (isAccepted) filter.isAccepted = isAccepted
        if (active) filter.active = active
        if (boardId) filter.boardId = new ObjectId(boardId)

        switch (status) {
            case 'applied':
                if (author) filter.author = new ObjectId(author)
                break
            case 'accepted':
            case 'unaccpeted':
                if (applicant) filter.applicant = new ObjectId(applicant)
                break
            default:
                break
        }

        if (kind && kind !== 'all') {
            let boardIds = undefined
            let listByKind = undefined

            if (filter.author) {
                listByKind = await boardColl.find(
                    { author: new ObjectId(filter.author), kind },
                    { projection: { _id: true } }
                ).toArray()

                filter.boardId = listByKind.map(board => new ObjectId(board._id))
            }

            if (filter.applicant) {
                boardIds = await applicationColl.find(
                    { applicant: new ObjectId(filter.applicant) },
                    { projection: { boardId: true } }
                ).toArray()

                listByKind = await boardColl.find(
                    { _id: boardIds.map(board => new ObjectId(board._id)), kind },
                    { projection: { _id: true } }
                ).toArray()

                filter.boardId = listByKind.map(board => new ObjectId(board._id))
            }
        }

        const list: Array<Application> | null  = await applicationColl.find(filter, { skip, limit, sort: { createdAt: -1 } }).toArray()
        const count = await applicationColl.countDocuments(filter)

        return { list, count }
    },
    IsApplied: async (params: { applicant: string, boardId: string }) => {
        const { applicant, boardId } = params

        return (await applicationColl.countDocuments({
            applicant: new ObjectId(applicant),
            boardId: new ObjectId(boardId),
            active: true
        })) > 0
    },
    IsAccepted: async (params: { applicant: string, boardId: string }) => {
        const { applicant, boardId } = params

        return (await applicationColl.countDocuments({
            applicant: new ObjectId(applicant),
            boardId: new ObjectId(boardId),
            isAccepted: true
        })) > 0
    },
    UpdateIsAccepted: (params: { _id: string, boardId: string, author: string }) => {
        const { _id, boardId, author } = params
        
        return applicationColl.updateOne(
            { _id: new ObjectId(_id), boardId: new ObjectId(boardId), author: new ObjectId(author) },
            { $set: { isAccepted: true, updatedAt: new Date() }
        })
    },
    Delete: async (params: { _id: string, boardId: string, author: string }) => {
        const { _id, boardId, author } = params

        const boardCount = (await boardColl.countDocuments({
            _id: new ObjectId(boardId),
            author: new ObjectId(author),
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
