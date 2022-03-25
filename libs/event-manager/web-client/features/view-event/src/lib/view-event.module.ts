import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { BuyTicketsModule } from '@event-manager-web-client/buy-tickets';
import { GenerateEventQrModule } from '@event-manager/event-manager/web-client/features/generate-event-qr';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DurationTimePipe } from './duration-time.pipe';
import { RelativeTimePipe } from './relative-time.pipe';
import { TicketStatusMessagePipe } from './ticket-status-message.pipe';
import { ViewEventComponent } from './view-event.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: ViewEventComponent,
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
  ],
  declarations: [
    TicketStatusMessagePipe,
    DurationTimePipe,
    RelativeTimePipe,
    ViewEventComponent,
  ],
})
export class ViewEventModule {}
