import { Module, Controller, Get } from '@nestjs/common';

@Controller('health')
class HealthController {
  @Get()
  check() {
    return { status: 'ok', service: 'alathar-api-v2', version: '0.1.0' };
  }
}

@Module({
  controllers: [HealthController],
})
export class AppModule {}
