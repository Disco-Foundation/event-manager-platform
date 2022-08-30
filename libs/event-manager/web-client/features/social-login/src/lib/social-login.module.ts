import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SocialLoginComponent } from './social-login.component';

@NgModule({
  declarations: [SocialLoginComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
        {
          path: '',
          pathMatch: 'full',
          component: SocialLoginComponent,
        },
    ])
    ],
  })

export class SocialLoginModule {}
