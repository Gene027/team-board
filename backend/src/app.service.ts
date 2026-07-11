import { Injectable } from '@nestjs/common';

export interface HealthCheckResponse {
  status: 'ok';
  service: 'teamboard-api';
  timestamp: string;
}

@Injectable()
export class AppService {
  getHealth(): HealthCheckResponse {
    return {
      status: 'ok',
      service: 'teamboard-api',
      timestamp: new Date().toISOString(),
    };
  }
}
