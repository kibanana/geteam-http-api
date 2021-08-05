import { Board } from '@models/entities'

export default interface BoardItemResponse {
    board: Board;
    isApplied?: boolean;
    isAccepted?: boolean;
}
