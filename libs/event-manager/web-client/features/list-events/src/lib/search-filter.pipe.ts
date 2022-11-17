import { Pipe, PipeTransform } from '@angular/core';
import { EventItem } from '@event-manager-web-client/data-access';
@Pipe({
  name: 'searchFilter',
})
export class SearchFilterPipe implements PipeTransform {
  transform(value: EventItem[], search: string): EventItem[] | undefined {
    const regexp = new RegExp(search, 'i');
    return [
      ...value.filter((item: EventItem) => {
        return regexp.test(item.account.name);
      }),
    ];
  }
}
