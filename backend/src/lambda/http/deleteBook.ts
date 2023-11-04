import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteBook } from '../../businessLogic/BookService'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import BookError from '../../utils/BookError'

const logger = createLogger('deleteBook')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('deleteBook event', { event })
    const bookId = event.pathParameters.bookId
    const userId = getUserId(event)

    const res = await deleteBook(userId, bookId)

    let statusCode

    if (res instanceof BookError) {
      statusCode = res.code
    } else {
      statusCode = 204
    }

    return {
      statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: ''
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
