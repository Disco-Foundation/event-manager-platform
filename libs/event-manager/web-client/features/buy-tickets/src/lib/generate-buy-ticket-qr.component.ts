import { Component, Input} from '@angular/core';
import QRCodeStyling from 'qr-code-styling';
import { createQR } from './createQR';

@Component({
  selector: 'em-generate-buy-ticket-qr',
  template: `
    <div class="flex justify-center mt-2 mb-5">
        <div id="qr-container"></div>
      </div>
  `,
})
export class GenerateBuyTicketQrComponent  {

  @Input() set qrdata(value:{
    ticketsAmount: number,
    eventId: string
  }) {
    this.generateQR(value.ticketsAmount, value.eventId);
  }

  QR: QRCodeStyling | null = null;


  generateQR(ticketsAmount: number, eventId: string){
    const data = "https://api.disco.foundation/api/buy-tickets-qr?ticketsAmount=" + ticketsAmount.toString() + "&eventId=" + eventId.toString();
    let dataURL = new URL(data);

    const encoded = encodeURIComponent(dataURL.toString());

    const qrInfo = "solana:" + encoded;
    this.QR = createQR(qrInfo, 240);
    const container = document.getElementById('qr-container');
    if (container) {
      container.innerHTML = "";
      this.QR.append(container);
    }
  }
}
