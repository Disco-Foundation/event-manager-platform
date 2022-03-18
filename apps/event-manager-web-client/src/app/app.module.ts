import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { HdWalletAdapterModule } from '@heavy-duty/wallet-adapter';
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
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
