import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
    constructor(private healthCheckService: HealthCheckService) {}

    @Get()
    @HealthCheck()
    check() {
        return this.healthCheckService.check([]);
    }
}
