import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { BuyTicketsModule } from '@event-manager-web-client/buy-tickets';
import { GenerateEventQrModule } from '@event-manager/event-manager/web-client/features/generate-event-qr';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DurationTimePipe } from './duration-time.pipe';
import { RelativeTimePipe } from './relative-time.pipe';
import { TicketStatusMessagePipe } from './ticket-status-message.pipe';
import { ViewDraftEventComponent } from './view-draft-event.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: ViewDraftEventComponent,
      },
    ]),
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    NgxChartsModule,
    BuyTicketsModule,
    GenerateEventQrModule,
    ReactiveFormsModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
  ],
  declarations: [
    TicketStatusMessagePipe,
    DurationTimePipe,
    RelativeTimePipe,
    ViewDraftEventComponent,
  ],
})
export class ViewDraftEventModule {}
