import { OrderOption } from './option'

export interface QueryString {
    offset?: string | number;
    limit?: string | number;
    option?: string;
    order?: string | OrderOption;
    kind?: string;
    author?: string;
    is_accepted?: string;
    active?: string;
    searchText?: string;
}
