import { ObjectId } from 'mongodb'

export interface Filter {
    isAccepted: boolean;
    active: boolean;
    boardId: ObjectId | ObjectId[];
    authorId: ObjectId;
    applicantId: ObjectId;
}
