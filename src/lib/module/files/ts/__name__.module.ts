import {Module} from '@nestjs/common'
import {ClientsModule} from '@nestjs/microservices'
import {kafka} from '../main'

@Module({
  imports: [ClientsModule.register([kafka.module('<%= name %>')])]
})
export class <%= classify(name) %>Module {}
