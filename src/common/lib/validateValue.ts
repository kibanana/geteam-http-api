import {
    CategoryType,
    KindType
} from '@common/constants'

export const validateKind = (kind?: string) => {
    switch (kind) {
        case KindType.All:
        case KindType.Study:
        case KindType.Contest:
            return kind
        default:
            return null
    }
}

export const validateCategory = (kind?: string, category?: string) => {
    if (kind === KindType.Study) {
        switch (category) {
            case CategoryType.Development:
            case CategoryType.Design:
            case CategoryType.Etc:
                return category
            default:
                return null
        }
    } else if (kind === KindType.Contest) {
        switch (category) {
            case CategoryType.Development:
            case CategoryType.Design:
            case CategoryType.Idea:
            case CategoryType.Etc:
                return category
            default:
                return null
        }
    }

    return null
}

export const validateModifyOrder = (order?: string) => {
    switch (order) {
        case 'createdAt':
        case 'endDay':
        case 'hit':
            return { [order]: -1, title: 1 }
        case 'title':
            return  { [order]: -1, createdAt: -1 }
        default:
            return null
    }
}
