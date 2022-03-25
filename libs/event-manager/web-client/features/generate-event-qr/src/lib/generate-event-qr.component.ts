import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import QRCodeStyling from 'qr-code-styling';
import { createQR } from './createQR';

@Component({
  selector: 'em-generate-event-qr',
  template: `
    <div
      class="py-8 disco-border border-4 border-b-0 blue backdrop-blur-sm bg-opacity-5"
    >
      <header class="flex flex-col items-center gap-2">
        <h2
          class="m-0 text-3xl text-center font-bold disco-text blue disco-font"
        >
          Scan the QR to pair
        </h2>
      </header>

      <div class="flex justify-center mt-10 mb-5">
        <div id="qr-container"></div>
      </div>
    </div>
  `,
})
export class GenerateEventQrComponent implements OnInit {
  readonly eventName: string;
  readonly eventId: string;

  QR: QRCodeStyling | null = null;

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA)
    data: {
      eventName: string;
      eventId: string;
    }
  ) {
    this.eventName = data.eventName;
    this.eventId = data.eventId;
  }

  ngOnInit(): void {
    const data = {
      eventId: this.eventId,
      eventName: this.eventName,
    };

    this.QR = createQR(JSON.stringify(data), 340);
    const container = document.getElementById('qr-container');
    console.log(this.QR, container);
    if (container) this.QR.append(container);
  }
}
