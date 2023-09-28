import 'dotenv/config'
import {AppModule} from './app.module'
import {bootstrap, generateApiDoc} from '@scrypt-swiss/nest'
import {name, version, description} from '../package.json'

const port = CHANGEME
if (process.argv.includes('-d'))
  generateApiDoc(AppModule, name, version, description, port)
else
  bootstrap(AppModule, name, port)
