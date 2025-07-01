import { Injectable, OnModuleInit } from '@nestjs/common';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

@Injectable()
export class TracingService implements OnModuleInit {
    onModuleInit() {
        if (process.env.OTEL_ENABLED !== 'true') return;

        const sdk = new NodeSDK({
            traceExporter: new OTLPTraceExporter({
                url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
            }),
            serviceName: process.env.SERVICE_NAME || 'nest-app',
            instrumentations: [getNodeAutoInstrumentations()],
        });

        sdk.start();
        console.log('[OpenTelemetry] Tracing iniciado');
    }
}
