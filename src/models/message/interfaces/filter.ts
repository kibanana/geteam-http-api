import { ObjectId } from 'mongodb'

export interface Filter {
    recvAccountId: ObjectId;
    sendAccountId: ObjectId;
}
