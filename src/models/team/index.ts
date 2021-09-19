import { connection } from 'mongoose'
import { ObjectId } from 'mongodb'
import { entities } from '@common/constants'
import { Member } from '@models/entities'

const teamColl = connection.collection(entities.TEAM)

export default {
    Create: (params: {
        name: string,
        masterId: string,
        members: Member[],
        content: string
    }) => {
        const { name, masterId, members, content } = params
        
        return teamColl.insertOne({
            name,
            masterId: new ObjectId(masterId),
            members,
            content,
            createdAt: new Date()
        })
    },
}