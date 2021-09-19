import {
    Document,
    ObjectId
} from 'mongodb'
import {
    Account,
    Board
} from '@models/entities'

export interface ContestApplication {
    position?: string; // only contest
    portfolio?: string; // link. only contest
    portfolioText?: string; // only contest
}

export interface Application extends Document {
    _id: ObjectId;

    applicantId: Account['_id'];
    boardId: Board['_id'];
    authorId: Account['_id'];
    position: ContestApplication['position'];
    portfolio: ContestApplication['portfolio'];
    portfolioText: ContestApplication['portfolioText'];
    wantedText: string;
    isAccepted: boolean;
    acceptedAt: Date;
    active: boolean;
    
    createdAt: Date;
    updatedAt: Date;
}
