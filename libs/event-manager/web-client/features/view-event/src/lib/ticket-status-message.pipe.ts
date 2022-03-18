import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'emTicketStatusMessage',
})
export class TicketStatusMessagePipe implements PipeTransform {
  transform(total: number, sold: number): string {
    if (total === sold) {
      return 'All tickets have been sold out.';
    } else if (sold === 0) {
      return `Out of the total of ${total.toLocaleString(
        'en-US'
      )} tickets, none have been sold.`;
    } else {
      return `Out of the total of ${total.toLocaleString(
        'en-US'
      )} tickets, ${sold.toLocaleString('en-US')} have been already sold.`;
    }
  }
}
