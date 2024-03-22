import {Module} from '@nestjs/common'
import {ShutdownModule} from '@scrypt-swiss/nest'

@Module({
  imports: [ShutdownModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
