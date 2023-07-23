import { Logger, Injectable, ExceptionFilter, Catch, ArgumentsHost, NotFoundException, HttpAdapterHost, HttpException, HttpStatus } from '@nestjs/common'

@Injectable()
@Catch()
export class AllExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionFilter.name)
    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }
    catch(exception, host: ArgumentsHost) {
        this.logger.warn('EXCEPTION', exception)
        const { httpAdapter } = this.httpAdapterHost
        const ctx = host.switchToHttp()
        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR
        const responseBody = {
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
        }
        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus)
    }
}
