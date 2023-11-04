import { getBooksByUserId,
         getBookDb,
         createBookDb,
         updateBookDb,
         deleteBookDb,
         updateAttachmentUrlInDb } from '../database/BookRepository'
import { getUploadUrl, getAttachmentUrl } from '../fileStorage/attachmentUtils';
import { Book } from '../models/Book'
import { BookUpdate } from '../models/BookUpdate'
import { CreateBookRequest } from '../requests/CreateBookRequest'
import { UpdateBookRequest } from '../requests/UpdateBookRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

import BookError from '../utils/BookError'

const logger = createLogger('BookService')

export async function getBooks(
  userId: string
): Promise<Book[] | BookError> {
  try {
    const books = await getBooksByUserId(userId)
    logger.info(`Books of user: ${userId}`, JSON.stringify(books))
    return books
  } catch (error) {
    const errorMsg = `Error occurred when getting user's books`
    logger.error(errorMsg)
    return new BookError(errorMsg, 500)
  }
}

export async function createBook(
  userId: string,
  createBookRequest: CreateBookRequest
): Promise<Book | BookError> {
  const bookId = uuid.v4()
  const newItem: Book = {
    userId,
    bookId,
    createdAt: new Date().toISOString(),
    attachmentUrl: null,
    isRead: false,
    readDate: "",
    ...createBookRequest
  }

  try {
    await createBookDb(newItem)
    logger.info(`Book ${bookId} for user ${userId}:`, {
      userId,
      bookId,
      book: newItem
    })
    return newItem
  } catch (error) {
    const errorMsg = `Error occurred while creating book`
    logger.error(errorMsg)
    return new BookError(errorMsg, 500)
  }
}

export async function updateBook(
  userId: string,
  bookId: string,
  updateBookRequest: UpdateBookRequest
): Promise<void | BookError> {
  try {
    const item = await getBookDb(userId, bookId)

    if (!item) throw new BookError('Book not found', 404)

    if (item.userId !== userId) {
      throw new BookError('User is not authorized to update book', 403)
    }

    await updateBookDb(userId, bookId, updateBookRequest as BookUpdate)
    logger.info(`Updating todo ${bookId} for user ${userId}:`, {
      userId,
      bookId,
      todoUpdate: updateBookRequest
    })
  } catch (error) {
    if (!error.code) {
      error.code = 500
      error.message = 'Error occurred when updating book'
    }
    logger.error(error.message)
    return error
  }
}

export async function deleteBook(
  userId: string,
  bookId: string
): Promise<void | BookError> {
  try {
    const item = await getBookDb(userId, bookId)
    if (!item) throw new BookError('Item not found', 404)
    if (item.userId !== userId) {
      throw new BookError('User is not authorized to delete item', 403)
    }
    await deleteBookDb(userId, bookId)
    logger.info(`Deleted book ${bookId} for user ${userId}:`, {
      userId,
      bookId
    })
  } catch (error) {
    if (!error.code) {
      error.code = 500
      error.message = 'Error occurred when deleting todo item'
    }
    logger.error(error.message)
    return error
  }
}

export async function updateAttachmentUrl(
  userId: string,
  bookId: string,
  attachmentId: string
): Promise<void | BookError> {
  try {
    const attachmentUrl = await getAttachmentUrl(attachmentId)

    const item = await getBookDb(userId, bookId)

    if (!item) throw new BookError('Item not found', 404)

    if (item.userId !== userId) {
      throw new BookError('User is not authorized to update item', 403)
    }

    await updateAttachmentUrlInDb(userId, bookId, attachmentUrl)

    logger.info(
      `Updated book ${bookId} with attachment URL ${attachmentUrl}`,
      {
        userId,
        bookId
      }
    )
  } catch (error) {
    if (!error.code) {
      error.code = 500
      error.message = 'Error occurred when deleting todo item'
    }
    logger.error(error.message)
    return error
  }
}

export function generateSignedUrl(attachmentId: string): string | BookError {
  try {
    const uploadUrl = getUploadUrl(attachmentId)
    logger.info(`Presigned Url is generated: ${uploadUrl}`)

    return uploadUrl
  } catch (error) {
    const errorMsg = 'Error occurred when generating presigned Url to upload'
    logger.error(errorMsg)
    logger.error(error)
    return new BookError(errorMsg, 500)
  }
}