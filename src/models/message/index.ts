import { connection } from 'mongoose'
import { ObjectId } from 'mongodb'
import { entities } from '@common/constants'
import { PaginationOption } from '@common/interfaces'
import { Message } from '@models/entities'
import { Filter } from './interfaces'

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
    GetList: async (params: { recvAccountId?: string, sendAccountId?: string }, options: PaginationOption) => {
        const { recvAccountId, sendAccountId } = params
        const { skip, limit } = options

        const filter: Partial<Filter> = {}
        if (recvAccountId) filter.recvAccountId = new ObjectId(recvAccountId)
        if (sendAccountId) filter.sendAccountId = new ObjectId(sendAccountId)

        const list: Array<Message> | null = await messageColl.find(filter, { skip, limit }).toArray()
        const count = await messageColl.countDocuments(filter)

        return { list, count }
    },
    UpdateIsRead: (params: { _id: string, recvAccountId: string }) => {
        const { _id, recvAccountId } = params

        return messageColl.updateOne(
            { _id: new ObjectId(_id), recvAccountId: new ObjectId(recvAccountId) },
            { $set: { isRead: true, readAt: new Date() } }
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
