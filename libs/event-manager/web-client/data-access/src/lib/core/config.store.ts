import { Inject, Injectable } from '@angular/core';
import {
  getTokenData,
  TokenData,
} from '@event-manager/event-manager/web-client/features/get-token-image';
import { ComponentStore } from '@ngrx/component-store';
import { from } from 'rxjs';
import { EnvironmentConfig, ENVIRONMENT_CONFIG } from '../types/environment';

interface ViewModel {
  acceptedMintLogoURI: string;
  acceptedMintSymbol: string;
}

const initialState: ViewModel = {
  acceptedMintLogoURI: '',
  acceptedMintSymbol: '',
};

@Injectable()
export class ConfigStore extends ComponentStore<ViewModel> {
  readonly acceptedMintLogo$ = this.select(
    ({ acceptedMintLogoURI }) => acceptedMintLogoURI
  );

  readonly acceptedMintSymbol$ = this.select(
    ({ acceptedMintSymbol }) => acceptedMintSymbol
  );

  constructor(
    @Inject(ENVIRONMENT_CONFIG) private environment: EnvironmentConfig
  ) {
    super(initialState);
    this._setAcceptedMintData(
      from(getTokenData(this.environment.acceptedMint.publicKey))
    );
  }

  private readonly _setAcceptedMintData = this.updater<TokenData>(
    (state, tokenData) => ({
      acceptedMintLogoURI: tokenData.logoURI,
      acceptedMintSymbol: tokenData.symbol,
    })
  );
}
