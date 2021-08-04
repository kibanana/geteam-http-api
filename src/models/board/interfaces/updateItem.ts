import KindType from '@common/constants/kindType'
import CategoryType from '@common/constants/categoryType'
import { Position } from '@models/entities/board'

export default interface UpdateItem {
    _id?: string;
    author?: string;
    kind: KindType;
    category: CategoryType;
    topic: string;
    title: string;
    content: string;
    positions?: Position[];
    wantCnt: number;
    endDate: Date;
    updatedAt?: Date;
}
