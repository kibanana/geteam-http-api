import { connection } from 'mongoose'
import { ObjectId } from 'mongodb'
import PaginationOption from '@common/interfaces/PaginationOption'
import entities from '@models/entities'
import Filter from './interfaces/filter'

const messageColl = connection.collection(entities.MESSAGE)

export default {
    Create: (params: {
        recvAccountId: string,
        sendAccountId: string,
        content: string,
        originalId: string
    }) => {
        const { originalId, recvAccountId, sendAccountId, content } = params

        return messageColl.insertOne({
            originalId: new ObjectId(originalId),
            recvAccount: new ObjectId(recvAccountId),
            sendAccount: new ObjectId(sendAccountId),
            content,
            createdAt: new Date()
        })
    },
    GetList: (params: { recvAccountId?: string, sendAccountId?: string }, options: PaginationOption) => {
        const { recvAccountId, sendAccountId } = params
        const { skip, limit } = options

        const filter: Partial<Filter> = {}
        if (recvAccountId) filter.recvAccountId = new ObjectId(recvAccountId)
        if (sendAccountId) filter.sendAccountId = new ObjectId(sendAccountId)

        return messageColl.find(filter, { skip, limit }).toArray()
    },
    UpdateIsReaded: (params: { _id: string, recvAccountId: string }) => {
        const { _id, recvAccountId } = params

        return messageColl.updateOne(
            { _id: new ObjectId(_id), recvAccountId: new ObjectId(recvAccountId) },
            { $set: { isRead: true, readAt: new Date() } },
        )
    },
    DeleteList: (params: { ids: string[], accountId: string }) => {
        const { ids, accountId } = params

        return messageColl.deleteMany({
            _id: { $in: ids.map((id: string) => new ObjectId(id)) },
            $or: [
                { recvAccountId: new ObjectId(accountId) },
                { sendAccountId: new ObjectId(accountId) }
            ]
        })
    },
    DeleteItem: (params: { _id: string, accountId: string }) => {
        const { _id, accountId } = params
        
        return messageColl.deleteOne({
            _id: new ObjectId(_id),
            $or: [
                { recvAccountId: new ObjectId(accountId) },
                { sendAccountId: new ObjectId(accountId) }
            ]
        })
    }
}
