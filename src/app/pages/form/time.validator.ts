import { FormControl } from '@angular/forms';

export interface ValidationResult {
  [key: string]: boolean;
}

export class TimeValidator {

  public static validate(control: FormControl): ValidationResult {
    if (control.value) {
      const pattern = /^([01]?[0-9]|2[0-3])\.([0-5]\d)$/;
      const valid = pattern.test(control.value);
      if (!valid) {
        return { validate: true };
      }
    }
    return null;
  }
}
