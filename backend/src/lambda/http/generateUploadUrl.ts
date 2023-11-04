import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { generateSignedUrl,  updateAttachmentUrl} from '../../businessLogic/BookService'
import { getUserId } from '../utils'
import BookError from '../../utils/BookError'
import { createLogger } from '../../utils/logger'
import * as uuid from 'uuid'

const logger = createLogger('generateUploadUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const bookId = event.pathParameters.bookId
    const userId = getUserId(event)
    const attachmentId = uuid.v4()

    const res = generateSignedUrl(attachmentId)

    logger.info('Generating signed url ', res)

    if (res instanceof BookError) {
      return {
        statusCode: res.code,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ msg: res.message })
      }
    }

    const uploadAttachmentUrlRes = await updateAttachmentUrl(
      userId,
      bookId,
      attachmentId
    )
    if (uploadAttachmentUrlRes instanceof BookError) {
      return {
        statusCode: uploadAttachmentUrlRes.code,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ msg: uploadAttachmentUrlRes.message })
      }
    }
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ uploadUrl: res })
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
