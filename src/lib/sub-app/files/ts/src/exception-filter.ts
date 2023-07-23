import { Logger, Injectable, ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { Request, Response } from 'express'

@Injectable()
@Catch()
export class AllExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionFilter.name)
    catch(exception, host: ArgumentsHost) {
        this.logger.warn(JSON.stringify(exception, null, 4))
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const request = ctx.getRequest<Request>()
        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR
        response
            .status(httpStatus)
            .json(exception.response ?? {
                statusCode: httpStatus,
                message: exception.message,
                timestamp: new Date().toISOString(),
                path: request.url,
            })
    }
}
