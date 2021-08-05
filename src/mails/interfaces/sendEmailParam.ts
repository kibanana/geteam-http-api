
import Board from '@models/entities/board'

export default interface SendEmailParam {
    email: string;
    key: string;
    name: string;
    password: string;
    kind: string;
    boardId: Board['_id'];
    boardTitle: Board['title'];
    boardAuthor: Board['author'];
    title: string;
    content: string;
}
