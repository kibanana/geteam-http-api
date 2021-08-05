import { ObjectId } from 'mongodb'
import {
	CategoryType,
	KindType,
} from '@common/constants'
import { Account } from '@models/entities'

export interface Position {
    title: string;
    description: string;
    cnt?: number;
}

export interface Board {
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
