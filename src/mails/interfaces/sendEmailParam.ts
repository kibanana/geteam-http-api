import {
    Account,
    Board
} from '@models/entities'

export interface SendEmailParam {
    email: string;
    key: string;
    name: string;
    password: string;
    kind: string;
    boardId: Board['_id'];
    boardTitle: Board['title'];
    boardAuthor: Account['name'];
    title: string;
    content: string;
}
