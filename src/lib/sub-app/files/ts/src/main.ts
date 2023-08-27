import 'dotenv/config'
import {NestFactory} from '@nestjs/core'
import {AppModule} from './app.module'
import {ValidationPipe} from '@nestjs/common'
import {AllExceptionFilter} from './exception-filter'
import {rawBody} from './rawbody.middleware'
import {requestLogger} from './logger.middleware'
import {Logger} from './logger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {bodyParser: false, logger: new Logger('<%= classify(name) %>', {timestamp: true, logLevels: process.env.LOG_LEVELS ? JSON.parse(process.env.LOG_LEVELS) : process.env.NODE_ENV === 'production' ? ['error', 'warn', 'log'] : ['error', 'warn', 'log', 'debug']})})
  app.enableCors()
  app.use(rawBody, requestLogger)
  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalFilters(new AllExceptionFilter())
  await app.listen(Number(process.env.PORT ?? 4000 CHANGEME), '0.0.0.0')
}
bootstrap()
