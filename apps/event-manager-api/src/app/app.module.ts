import { Module, Provider } from '@nestjs/common';
import { environment } from '../environments/environment';
import { AppController } from './app.controller';
import { AppService } from './app.service';

export interface EnvironmentProvider {
  production: boolean;
  programId: string;
  network: string;
  keyFilesPath: string;
}

const PROVIDER: Provider<EnvironmentProvider> = {
  provide: 'ENVIRONMENT',
  useValue: {
    production: environment.production,
    programId: environment.programId,
    network: environment.network,
    keyFilesPath: environment.keyFilesPath,
  },
};

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PROVIDER],
})
export class AppModule {}
