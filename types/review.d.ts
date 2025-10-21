export interface ReviewResponse {
    id: string;
    rating: number;
    comment: string;
    product_id: string;
    static_files: string[]; // mảng chứa URL ảnh
    user_id: string;
    created_at: Date
    updated_at: Date
    replies?: ReviewResponse[]; // phản hồi con
}
  