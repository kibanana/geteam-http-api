import { ObjectId } from 'mongodb'
import { Account } from '@models/entities'

interface Member {
    accountId: Account['_id'];
    position: string;
}

export interface Team {
    _id: ObjectId;

    name: string;
    master: Account['_id'];
    members: Member[];
    content: string;
    
    createdAt: Date;
}
