import {
  Directive,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BuyTicketsComponent } from './buy-tickets.component';

@Directive({ selector: '[emBuyTicketsTrigger]' })
export class BuyTicketsTriggerDirective {
  @Input() eventName: string | null = null;
  @Input() ticketPrice: number | null = null;
  @Output() buyTickets = new EventEmitter<number>();
  @HostListener('click') onClick() {
    if (this.eventName === null) {
      throw new Error('Event name is missing');
    }

    if (this.ticketPrice === null) {
      throw new Error('Ticket price is missing');
    }

    this._matBottomSheet
      .open<BuyTicketsComponent, { eventName: string; ticketPrice: number }>(
        BuyTicketsComponent,
        {
          data: {
            eventName: this.eventName,
            ticketPrice: this.ticketPrice,
          },
          panelClass: ['disco-bottom-sheet', 'blue', 'bg-opacity-5'],
        }
      )
      .afterDismissed()
      .subscribe((quantity) => quantity && this.buyTickets.emit(quantity));
  }

  constructor(private readonly _matBottomSheet: MatBottomSheet) {}
}
