import {
    KindType,
    CategoryType,
} from '@common/constants'
import { Position } from '@models/entities/board'

export interface UpdateItem {
    _id?: string;
    authorId?: string;
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
