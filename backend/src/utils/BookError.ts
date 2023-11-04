export default class BookError extends Error {
    code: number

    constructor(message: string, code: number) {
      super()
      this.message = message
      this.code = code
    }
  }