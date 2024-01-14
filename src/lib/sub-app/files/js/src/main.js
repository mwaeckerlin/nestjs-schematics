import 'dotenv/config'
import {HttpAdapterHost, NestFactory} from '@nestjs/core'
import {AppModule} from './app.module'
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger'
import {name, version, description} from '../package.json'
import {ValidationPipe} from '@nestjs/common'
import {AllExceptionFilter} from '@scrypt-swiss/nest'

const Name = name // generate name from package definition
  .replace(/-[a-z]/, (g) => ' ' + g[1].toUpperCase())
  .replace(/^[a-z]/, (g) => g.toUpperCase())

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalFilters(new AllExceptionFilter(app.get(HttpAdapterHost)))
  const options = new DocumentBuilder()
    .setTitle(Name + ' API definition')
    .setDescription(description)
    .setVersion(version)
    .addServer('http://localhost:4000' CHANGE PORT, 'Testing environment.')
    .build()
  const document = SwaggerModule.createDocument(app, options)
  console.log(document)
  SwaggerModule.setup('api', app, document)
  await app.listen(Number(process.env.PORT ?? 4000 CHANGE PORT), '0.0.0.0')
}
bootstrap()
