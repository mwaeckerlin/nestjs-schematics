import {Logger} from '@nestjs/common'
import {json} from 'body-parser'
import {NextFunction, Request, Response} from 'express'

export function rawBody(req: any, res: Response, next: NextFunction): any {
    const logger = new Logger('RawBody-Middleware')
    req.rawBody = req.body ?? ''
    json({
        verify: (req: any, res, buffer) => {
            logger.verbose(buffer.toString())
            req.rawBody = Buffer.isBuffer(buffer) ? Buffer.from(buffer) : ''
            return true
        },
    })(req, res as any, next)
}