import { InjectionToken } from '@angular/core';

export interface EnvironmentConfig {
  acceptedMint: {
    publicKey: string;
    decimals: number;
  };
  network: string;
}

export const ENVIRONMENT_CONFIG = new InjectionToken<EnvironmentConfig>(
  'environmentConfig'
);

export const environmentConfigProviderFactory = (
  config: EnvironmentConfig
) => ({
  provide: ENVIRONMENT_CONFIG,
  useValue: {
    ...config,
  },
});
