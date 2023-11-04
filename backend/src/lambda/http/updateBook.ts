import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateBook } from '../../businessLogic/BookService'
import { UpdateBookRequest } from '../../requests/UpdateBookRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import BookError from '../../utils/BookError'

const logger = createLogger('updateBook')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('updateBook event', { event })
    const bookId = event.pathParameters.bookId
    const userId = getUserId(event)
    const updatedTodo: UpdateBookRequest = JSON.parse(event.body)
    const res = await updateBook(userId, bookId, updatedTodo)
    let statusCode
    if (res instanceof BookError) {
      statusCode = res.code
    } else {
      statusCode = 200
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
