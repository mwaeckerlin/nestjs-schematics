import {Module} from '@nestjs/common'
import {HealthModule} from '@scrypt-swiss/nest'

@Module({
  imports: [HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
