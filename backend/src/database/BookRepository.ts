import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
//import * as AWSXRay from "aws-xray-sdk-core";
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { Book } from '../models/Book'
import { BookUpdate } from '../models/BookUpdate';

const logger = createLogger('BookDataLayer')

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient()

const bookTable = process.env.BOOK_TABLE
const bookByUserIndex = process.env.BOOK_BY_USER_INDEX

export async function bookExists(userId: string, bookId: string): Promise<boolean> {
  const item = await getBookDb(userId, bookId)
  return !!item
}

export async function getBooksByUserId(userId: string): Promise<Book[]> {
  const result = await docClient
    .query({
      TableName: bookTable,
      IndexName: bookByUserIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    .promise()
  const items = result.Items
  logger.info(`All entries for user ${userId} were fetched`)
  return items as Book[]
}

export async function getBookDb(userId: string, bookId: string): Promise<Book> {
  const result = await docClient
    .get({
      TableName: bookTable,
      Key: {
        "userId": userId,
        "bookId": bookId
      }
    })
    .promise()
  const item = result.Item
  logger.info(`Book ${item} was fetched`)
  return item as Book
}

export async function createBookDb(Book: Book): Promise<void> {
  await docClient
    .put({
      TableName: bookTable,
      Item: Book
    })
    .promise()

  logger.info(`Book ${Book.bookId} was created`)
}

export async function updateBookDb(
  userId: string,
  bookId: string,
  bookUpdate: BookUpdate
): Promise<void> {
  let readDate = ""
  if (bookUpdate) {
    readDate = new Date().toISOString()
  }
  await docClient
    .update({
      TableName: bookTable,
      Key: {
        "userId": userId,
        "bookId": bookId
      },
      UpdateExpression: 'set title = :title, readDate = :readDate, isRead = :isRead',
      ExpressionAttributeValues: {
        ':title': bookUpdate.title,
        ':readDate': readDate,
        ':isRead': bookUpdate.isRead
      }
    })
    .promise()

  logger.info(`Book ${bookId} was updated`)
}

export async function deleteBookDb(userId: string, bookId: string): Promise<void> {
  await docClient
    .delete({
      TableName: bookTable,
      Key: {
        "userId": userId,
        "bookId": bookId
      }
    })
    .promise()

  logger.info(`Book ${bookId} deleted!`)
}

export async function updateAttachmentUrlInDb(
  userId: string,
  bookId: string,
  attachmentUrl: string
): Promise<void> {
  await docClient
    .update({
      TableName: bookTable,
      Key: {
        "userId": userId,
        "bookId": bookId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    })
    .promise()

  logger.info(`Attachment URL for book ${bookId} was updated`)
}