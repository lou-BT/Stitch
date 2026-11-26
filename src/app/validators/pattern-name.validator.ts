import { Directive, inject } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { DataService } from '../services/data.service';

// characters Windows refuses in folder names (each pattern gets a folder named after it)
const forbiddenCharacters = /[<>:"/\\|?*]/;

// Validates a new pattern's name, on an input with ngModel:
//   <input name="name" [(ngModel)]="pattern.name" required appPatternName>
// Errors: required (only spaces), invalidCharacters, invalidEnding (ends with a dot), duplicateName.
// An empty value is left to the `required` validator.
@Directive({
  selector: '[appPatternName]',
  providers: [{ provide: NG_VALIDATORS, useExisting: PatternNameValidatorDirective, multi: true }]
})
export class PatternNameValidatorDirective implements Validator {
  private data = inject(DataService);

  validate(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value ?? '';
    const name = value.trim();

    if (!name) return value ? { required: true } : null;
    if (forbiddenCharacters.test(name)) return { invalidCharacters: true };
    if (name.endsWith('.')) return { invalidEnding: true };
    if (this.data.isPatternNameTaken(name)) return { duplicateName: true };
    return null;
  }
}
