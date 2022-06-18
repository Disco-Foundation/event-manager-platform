import { Directive, HostListener, Input } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { GenerateEventQrComponent, GenerateBuyTicketQrComponent } from './generate-event-qr.component';

@Directive({ selector: '[emGenerateEventQrTrigger]' })
export class GenerateEventQrTriggerDirective {
  @Input() eventName: string | null = null;
  @Input() eventId: string | null = null;
  @HostListener('click') onClick() {
    if (this.eventName === null) {
      throw new Error('Event name is missing');
    }

    if (this.eventId === null) {
      throw new Error('Event id is missing');
    }

    this._matBottomSheet
      .open<GenerateEventQrComponent, { eventName: string; eventId: string }>(
        GenerateEventQrComponent,
        {
          data: {
            eventName: this.eventName,
            eventId: this.eventId,
          },
          panelClass: ['disco-bottom-sheet', 'blue', 'bg-opacity-5'],
        }
      )
      .afterDismissed()
      .subscribe((resp) => console.log(resp));
  }

  constructor(private readonly _matBottomSheet: MatBottomSheet) {}
}


@Directive({ selector: '[emGenerateBuyTicketQrTrigger]' })
export class GenerateBuyTicketQrTriggerDirective {
  @Input() amount: number | null = null;
  @Input() eventId: string | null = null;
  @HostListener('click') onClick() {
    if (this.amount === null) {
      throw new Error('tickets amount is missing');
    }

    if (this.eventId === null) {
      throw new Error('Event id is missing');
    }

    this._matBottomSheet
      .open<GenerateBuyTicketQrComponent, { amount: number; eventId: string }>(
        GenerateBuyTicketQrComponent,
        {
          data: {
            amount: this.amount,
            eventId: this.eventId,
          },
          panelClass: ['disco-bottom-sheet', 'blue', 'bg-opacity-5'],
        }
      )
      .afterDismissed()
      .subscribe((resp) => console.log(resp));
  }

  constructor(private readonly _matBottomSheet: MatBottomSheet) {}
}
