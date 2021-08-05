import {
    CategoryType,
    KindType,
} from '@common/constants'
import { OrderOption } from '@common/interfaces'

export const validateKind = (kind: string) => {
    switch (kind) {
        case KindType.All:
        case KindType.Study:
        case KindType.Contest:
            return kind
        default:
            return KindType.Study
    }
}

export const validateCategory = (kind: string, category: string) => {
    let result = CategoryType.Development

    if (kind === KindType.Study) {
        switch (category) {
            case CategoryType.Development:
            case CategoryType.Design:
            case CategoryType.Etc:
                result = category 
        }
    } else if (kind === KindType.Contest) {
        switch (category) {
            case CategoryType.Development:
            case CategoryType.Design:
            case CategoryType.Idea:
            case CategoryType.Etc:
                return category
        }
    }
  
    return result
}

export const validateModifyOrder = (order: string): OrderOption => {
    let result
    switch (order) {
        case 'createdAt': case 'endDay': case 'hit':
            result = { [order]: -1, title: 1 }
            break
        case 'title':
            result = { [order]: -1, createdAt: -1 }
            break
        default:
            throw new Error('해당 속성으로 정렬할 수 없습니다')
    }
    return result
}
