import { ObjectId } from 'mongodb'
import Account from './account'
import CategoryType from '@common/constants/categoryType'
import KindType from '@common/constants/kindType'

export interface Position {
    title: string;
    description: string;
    cnt?: number;
}

export default interface Board {
	_id?: ObjectId;

	author: Account['_id'];
	kind: KindType;
	category: CategoryType;
	topic: string;
	title: string;
	content: string;
	positions: Position[]; // only contest
	wantCnt: number;
	applicationCnt?: number;
	acceptCnt?: number;
	startDate: Date;
	endDate: Date;
	isCompleted?: boolean;
	active: boolean;
	hit: number;
	updatedAt: Date;
}
