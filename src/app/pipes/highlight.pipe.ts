import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'highlight',
  pure: true
})
export class HighlightPipe implements PipeTransform {
  constructor() {
  }

  transform(text: string, term: string): string {

    return term ? text.replace(term,  `<span class="mark highlight">${ term }</span>`) : text;
  }
}
