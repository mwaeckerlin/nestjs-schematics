import { Logger } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

export function requestLogger(req: Request, res: Response, next: NextFunction): any {
    const logger = new Logger('Request')
    logger.log(req.method + ' ' + req.url)
    logger.debug({ method: req.method, url: req.url, query: req.query, params: req.params, body: req.body, headers: req.headers, cookies: req.cookies })
    const oldJson = res.json
    res.json = (body) => {
        res.locals.body = body
        return oldJson.call(res, body)
    }
    res.on('finish', () => {
        logger.log(res.statusCode)
        logger.debug({ code: res.statusCode, response: res.locals.body })
    })
    next()
}