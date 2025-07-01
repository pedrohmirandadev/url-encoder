import { Injectable, OnModuleInit } from '@nestjs/common';
import { collectDefaultMetrics, Registry, Counter } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
    private readonly registry = new Registry();
    private readonly httpCounter = new Counter({
        name: 'http_requests_total',
        help: 'Total de requisições HTTP',
    });

    onModuleInit() {
        if (process.env.PROMETHEUS_ENABLED !== 'true') return;

        collectDefaultMetrics({ register: this.registry });
        this.registry.registerMetric(this.httpCounter);
    }

    incHttpRequests() {
        this.httpCounter.inc();
    }

    async getMetrics(): Promise<string> {
        return await this.registry.metrics();
    }
}
