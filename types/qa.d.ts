import { ProductItem } from "./products";
import { Customer } from "./user";

export interface QAResponse {
    id: string;
    rating: number;
    comment: string;
    product: ProductItem;
    static_files: string[];
    user: Customer;
    created_at: Date
    updated_at: Date
    replies?: QAResponse[];
}
  