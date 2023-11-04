import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getBooks } from '../../businessLogic/BookService'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger'
import BookError from '../../utils/BookError'

const logger = createLogger('getBooks')

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('getBooks event', { event })
    const userId = getUserId(event)
    const res = await getBooks(userId)
    let statusCode
    let body
    if (res instanceof BookError) {
      statusCode = res.code
      body = JSON.stringify({ msg: res.message })
    } else {
      statusCode = 200
      body = JSON.stringify({ items: res })
    }
    return {
      statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
