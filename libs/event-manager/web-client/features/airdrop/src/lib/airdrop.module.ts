import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { AirdropComponent } from './airdrop.component';

@NgModule({
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: AirdropComponent,
      },
    ]),
  ],
  declarations: [AirdropComponent],
})
export class AirdropModule {}
