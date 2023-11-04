export interface Book {
  userId: string
  bookId: string
  title: string
  isRead: boolean
  readDate: string
  attachmentUrl?: string
  createdAt: string
}
