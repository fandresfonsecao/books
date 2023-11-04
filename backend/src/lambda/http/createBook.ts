import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateBookRequest } from '../../requests/CreateBookRequest'
import { getUserId } from '../utils';
import { createBook } from '../../businessLogic/BookService'
import { createLogger } from '../../utils/logger'
import BookError from '../../utils/BookError'

const logger = createLogger('createBooks')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('createBooks event', { event })
    const newTodo: CreateBookRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    const res = await createBook(userId, newTodo)
    let statusCode
    let body
    if (res instanceof BookError) {
      statusCode = res.code
      body = JSON.stringify({ msg: res.message })
    } else {
      statusCode = 201
      body = JSON.stringify({
        item: {
          ...res
        }
      })
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
