import {Logger} from '@nestjs/common'
import {NextFunction, Request, Response} from 'express'
import axios from 'axios'

axios.interceptors.request.use(request => {
    const logger = new Logger('Axios')
    logger.debug(`${request.method} ${(request.baseURL ?? '') + request.url} …`)
    logger.verbose({
        request: `${request.method} ${(request.baseURL ?? '') + request.url}`,
        body: request.data,
        headers: request.headers
    })
    return request
})

axios.interceptors.response.use(response => {
    const logger = new Logger('Axios')
    logger.debug(`${response.request.method} ${(response.request.baseURL ?? '') + response.request.url} → ${response.status} ${response.statusText}`)
    logger.verbose({
        request: `${response.request.method} ${(response.request.baseURL ?? '') + response.request.url}`,
        status: `${response.status} ${response.statusText}`,
        data: response.data
    })
    return response
})

export function requestLogger(req: Request, res: Response, next: NextFunction): any {
    const logger = new Logger('Request')
    logger.log(`${req.method} ${req.method} …`)
    logger.verbose({
        request: req.method,
        url: req.url,
        query: req.query,
        params: req.params,
        body: req.body,
        headers: req.headers,
        cookies: req.cookies
    })
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
        logger.log(`${req.method} ${req.url} → ${res.statusCode}}`)
        logger.debug({
        })
        logger.verbose({
            request: `${req.method} ${req.url}`,
            status: `${res.statusCode} ${res.statusMessage}`,
            data: res.locals.body
        })
    })
    next()
}