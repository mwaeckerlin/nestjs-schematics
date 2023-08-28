import {Logger} from '@nestjs/common'
import {NextFunction, Request, Response} from 'express'
import {crop} from '@scrypt-swiss/lib'
import axios from 'axios'

axios.interceptors.request.use(request => {
    const logger = new Logger('Axios-Request')
    logger.debug(`curl -X '${(request.method ?? 'get').toUpperCase()}' ${request.baseURL ?? ''}${request.url ?? ''} ${Object.keys(request.headers)?.map(k => `-H '${k}: ${request.headers[k]}'`).join(' ')} -d '${JSON.stringify(request.data ?? '')}'`)
    return request
})

axios.interceptors.response.use(response => {
    const logger = new Logger('Axios-Response')
    logger.debug({status: `${response.status} ${response.statusText}`, data: crop(JSON.stringify(response.data))})
    return response
})

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
        logger.debug({
            status: `${res.statusCode} ${res.statusMessage}`, data: crop(JSON.stringify(res.locals.body))
        })
        logger.verbose({code: res.statusCode, headers: res.getHeaders(), response: crop(JSON.stringify(res.locals.body))})
    })
    next()
}