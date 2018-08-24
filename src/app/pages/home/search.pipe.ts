import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(buss, value): any {
    const valueLower = value.toLowerCase(); 
      return buss.filter(b => {
        const name = b['name'];
        if (name) {
          const nameLower = name.toLowerCase();
          return nameLower.includes(valueLower) ;
        }
      });

  }

}
