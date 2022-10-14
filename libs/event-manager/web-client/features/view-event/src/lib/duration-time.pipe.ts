import { Pipe, PipeTransform } from '@angular/core';
import { BN } from '@heavy-duty/anchor';

@Pipe({
  name: 'emDurationTime',
})
export class DurationTimePipe implements PipeTransform {
  private getMessage(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(seconds / 3600);
    const days = Math.floor(seconds / 86400);

    if (seconds < 1) {
      return null;
    } else if (seconds < 60) {
      return `${seconds.toLocaleString('en-US', {
        useGrouping: false,
      })}s`;
    } else if (seconds < 3600) {
      return `${minutes.toLocaleString('en-US', {
        useGrouping: false,
      })}m`;
    } else if (seconds < 86400) {
      return `${hours.toLocaleString('en-US', {
        useGrouping: false,
      })}h`;
    } else {
      return `${days.toLocaleString('en-US', {
        useGrouping: false,
      })}d`;
    }
  }

  transform(value: BN): string | null {
    return this.getMessage(Math.floor(value.toNumber() / 1000));
  }
}
