import { Directive, ElementRef, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appDisableControlSchedule]'
})
export class AppDisableControlDirective {

  constructor( private ngControl: NgControl, private el: ElementRef ) {
  }

  @Input()
  set disableControl( condition: boolean ) {
    const action = condition ? 'disable' : 'enable';
    if (condition === true) {
      this.el.nativeElement.value = '';
    }
    this.ngControl.control[action]();
  }

}
