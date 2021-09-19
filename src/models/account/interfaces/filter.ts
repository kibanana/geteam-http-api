import { ObjectId } from 'mongodb'

export interface Filter {
    _id: ObjectId;
    id: string;
    studentNumber: number;
}
