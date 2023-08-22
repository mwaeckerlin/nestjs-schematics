import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { AllExceptionFilter } from './exception-filter'
import { rawBody } from './rawbody.middleware'
import { requestLogger } from './logger.middleware'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false, logger: ['log', 'error', 'warn', 'debug', 'verbose'] })
  app.enableCors()
  app.use(rawBody, requestLogger)
  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalFilters(new AllExceptionFilter())
  await app.listen(Number(process.env.PORT ?? 4000 CHANGEME), '0.0.0.0')
}
bootstrap()
