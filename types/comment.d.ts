export interface Comment {
  id: number,
    name: string
    status: "purchased" | "pending" | "canceled" // nếu có nhiều trạng thái thì liệt kê thêm
    date: string // hoặc Date nếu muốn parse
    company?: string // có thể đổi sang type cụ thể nếu chỉ lưu tên file/logo
    comment: string
    rating: number
    listImages?: string[]
    reply?: CommentReply
}

  export interface CommentReply {
    name: string
    role: string
    comment: string
  }