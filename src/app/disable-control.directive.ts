import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appDisableControl]'
})
export class DisableControlDirective {

  constructor(private el: ElementRef) {

  }

  @Input()
  set blocked(blocked: boolean) {
    this.el.nativeElement.disabled = blocked;
  }

}
