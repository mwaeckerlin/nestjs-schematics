import {NestFactory} from '@nestjs/core'
import {AppModule} from './app.module'
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger'
import {name, version, description} from './../package.json'
import 'dotenv/config'

const Name = name // generate name from package definition
  .replace(/-[a-z]/, (g) => ' ' + g[1].toUpperCase())
  .replace(/^[a-z]/, (g) => g.toUpperCase())

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {bodyParser: false, logger: []})
  const options = new DocumentBuilder()
    .setTitle(Name + ' API definition')
    .setDescription(description)
    .setVersion(version)
    .addServer('http://localhost:4000' CHANGEME, 'Local Environment.')
    .addServer('https://fireblocks.test.scrypt.swiss', 'Testing Environment.')
    .addServer('https://fireblocks.scrypt.swiss', 'Production Environment.')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, options)
  console.log(JSON.stringify(document, null, 4))
  process.exit(0)
}
bootstrap()
