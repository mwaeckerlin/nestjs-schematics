import {Module} from '@nestjs/common'
import {HealthModule, ShutdownModule} from '@scrypt-swiss/nest'

@Module({
  imports: [ShutdownModule, HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
