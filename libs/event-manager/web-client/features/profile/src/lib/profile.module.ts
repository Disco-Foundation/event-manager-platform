import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { BuyTicketsModule } from '@event-manager-web-client/buy-tickets';
import { ProfileComponent } from './profile.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: ProfileComponent,
      },
    ]),
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    BuyTicketsModule,
    MatTabsModule,
  ],
  declarations: [ProfileComponent],
})
export class ProfileModule {}
