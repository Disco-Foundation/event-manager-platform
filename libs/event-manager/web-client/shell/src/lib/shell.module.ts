import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import {
  EnvironmentConfig,
  environmentConfigProviderFactory,
} from '@event-manager-web-client/data-access';
import {
  HdWalletAdapterDirective,
  HdWalletConnectButtonDirective,
  HdWalletDisconnectButtonDirective,
  HdWalletIconComponent,
} from '@heavy-duty/wallet-adapter-cdk';
import { HdWalletModalButtonDirective } from '@heavy-duty/wallet-adapter-material';
import { environment } from './config/config';
import { ShellComponent } from './shell.component';

@NgModule({
  declarations: [ShellComponent],
  imports: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    HttpClientModule,
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ShellComponent,
        children: [
          {
            path: 'list-events',
            loadChildren: () =>
              import('@event-manager-web-client/list-events').then(
                (m) => m.ListEventsModule
              ),
          },
          {
            path: 'create-event',
            loadChildren: () =>
              import('@event-manager-web-client/create-event').then(
                (m) => m.CreateEventModule
              ),
          },
          {
            path: 'view-event/:eventId',
            loadChildren: () =>
              import('@event-manager-web-client/view-event').then(
                (m) => m.ViewEventModule
              ),
          },
          {
            path: 'profile',
            loadChildren: () =>
              import('@event-manager-web-client/profile').then(
                (m) => m.ProfileModule
              ),
          },
          { path: '', redirectTo: '/list-events', pathMatch: 'full' },
        ],
      },
    ]),
    MatDialogModule,
    HdWalletAdapterDirective,
    HdWalletIconComponent,
    HdWalletConnectButtonDirective,
    HdWalletDisconnectButtonDirective,
    HdWalletModalButtonDirective,
  ],
})
export class ShellModule {
  static forRoot(
    environment: EnvironmentConfig
  ): ModuleWithProviders<ShellModule> {
    return {
      ngModule: ShellModule,
      providers: [environmentConfigProviderFactory(environment)],
    };
  }
}
