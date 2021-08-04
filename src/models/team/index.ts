import { connection } from 'mongoose'
import { ObjectId } from 'mongodb'
import entities from '@models/entities'
import Member from './interfaces/Member'

const teamColl = connection.collection(entities.TEAM)

export default {
    Create: (params: {
        name: string,
        master: string,
        members: Member[],
        content: string
    }) => {
        const { name, master, members, content } = params
        
        return teamColl.insertOne({
            name,
            leader: new ObjectId(master),
            members: members.map((member: Member) => {
                return {
                    accountId: new ObjectId(member.accountId),
                    position: {
                        title: member.position?.title,
                        description: member.position?.description
                    }
                } 
            }),
            content,
            createdAt: new Date(),
        })
    },
}