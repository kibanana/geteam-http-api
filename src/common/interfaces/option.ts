export interface OrderOption {
    createdAt?: number;
    endDay?: number;
    hit?: number;
    title?: number;
}

export interface PaginationOption {
    skip: number;
    limit: number;
}

export interface Option {
    skip?: number;
    limit?: number;
    option?: string;
    order?: OrderOption;
    searchText?: string;
}
