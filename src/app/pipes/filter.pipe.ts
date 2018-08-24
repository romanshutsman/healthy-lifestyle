import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(items: any[], term: number): any {
    if (term == null) {
      return items;
    }
    return items.filter(item => {
      if (item.phone.includes(term)) {

        return item;
      }
      return null;
    });
  }
}
