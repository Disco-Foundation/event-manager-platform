import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { LoginStore } from '@event-manager-web-client/data-access';
import { ShellModule } from '@event-manager-web-client/shell';
import { HdWalletAdapterModule } from '@heavy-duty/wallet-adapter';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([
      {
        path: '',
        loadChildren: () =>
          import('@event-manager-web-client/shell').then((m) => m.ShellModule),
      },
    ]),
    HdWalletAdapterModule.forRoot({ autoConnect: true }),
    ShellModule.forRoot({
      acceptedMint: {
        publicKey: environment.acceptedMint,
        decimals: environment.acceptedMintDecimals,
      },
      network: environment.network,
    }),
  ],
  providers: [LoginStore],
  bootstrap: [AppComponent],
})
export class AppModule {}
