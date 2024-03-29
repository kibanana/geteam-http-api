import {
    Document,
    ObjectId
} from 'mongodb'
import { Account } from '@models/entities'

export interface Message extends Document {
    _id: ObjectId;
    
    originalId: Message['_id']; // reply
    recvAccountId: Account['_id'];
    sendAccountId: Account['_id'];
    content: string;
    isRead?: boolean;
    readAt?: Date;
    createdAt: Date;
}
