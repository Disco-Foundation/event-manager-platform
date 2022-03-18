import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HdWalletAdapterCdkModule } from '@heavy-duty/wallet-adapter-cdk';
import { HdWalletAdapterMaterialModule } from '@heavy-duty/wallet-adapter-material';
import { ShellComponent } from './shell.component';

@NgModule({
  declarations: [ShellComponent],
  imports: [
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
    HdWalletAdapterCdkModule,
    HdWalletAdapterMaterialModule,
  ],
})
export class ShellModule {}
