import 'dotenv/config'
import {bootstrap, generateApiDoc, kafkaOptions} from '@scrypt-swiss/nest'
import {name, version, description} from '../package.json'
export const kafka = kafkaOptions(name)
import {AppModule} from './app.module'

const port = <%= port %>
if (process.argv.includes('-d'))
  generateApiDoc(AppModule, name, version, description, port)
else
  bootstrap(AppModule, name, version, port)
