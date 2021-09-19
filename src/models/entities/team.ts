import {
    Document,
    ObjectId
} from 'mongodb'
import { Account } from '@models/entities'

export interface Member {
    accountId: Account['_id'];
    position?: string;
}

export interface Team extends Document {
    _id: ObjectId;

    name: string;
    masterId: Account['_id'];
    members: Member[];
    content: string;
    
    createdAt: Date;
}
