import {InternalServerErrorException, Logger} from '@nestjs/common'
import {NextFunction, Request, Response} from 'express'

export function requestLogger(req: Request, res: Response, next: NextFunction): any {
    const logger = new Logger('Request')
    logger.log(req.method + ' ' + req.url)
    logger.verbose({method: req.method, url: req.url, query: req.query, params: req.params, body: req.body, headers: req.headers, cookies: req.cookies})
    const oldJson = res.json
    res.json = (body) => {
        try {
            res.locals.body = body
            return oldJson.call(res, body)
        } catch (e) {
            logger.error('Cannot convert Body to JSON')
            res.status(500)
            return oldJson.call(res)
        }
    }
    res.on('finish', () => {
        logger.log(`${res.statusCode} ${JSON.stringify(res.getHeaders())}`)
        logger.verbose({code: res.statusCode, headers: res.getHeaders(), response: res.locals.body})
    })
    next()
}