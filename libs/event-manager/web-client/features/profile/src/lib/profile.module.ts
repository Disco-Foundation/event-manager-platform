import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { BuyTicketsModule } from '@event-manager-web-client/buy-tickets';
import { ProfileComponent } from './profile.component';
import { UserStore } from './user.store';

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
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    BuyTicketsModule,
    MatTabsModule,
    MatFormFieldModule,
    ReactiveFormsModule,
  ],
  providers: [UserStore],
  declarations: [ProfileComponent],
})
export class ProfileModule {}
