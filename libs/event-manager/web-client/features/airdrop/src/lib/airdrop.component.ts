import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EventApiService } from '@event-manager-web-client/data-access';

@Component({
  selector: 'em-airdrop',
  template: `
    <div class="w-96 m-auto mt-20" *ngIf="!submitted">
      <h2
        class="text-3xl text-center font-bold disco-text blue disco-font mb-10"
      >
        Test Disco Protocol
      </h2>
      <form
        [formGroup]="airdropForm"
        (ngSubmit)="onSubmit()"
        class="flex flex-col gap-2"
      >
        <input
          class="text-black px-5 py-3 text-sm"
          type="text"
          formControlName="pubkey"
          placeholder="Enter a valid PublicKey"
          maxlength="44"
          required
        />

        <button
          class="w-full disco-btn pink ease-in duration-300 text-lg uppercase border-4 px-8 py-2 cursor-pointer font-bold"
          type="submit"
        >
          Request Airdrop
        </button>
      </form>
    </div>

    <div class="w-full flex justify-center mt-20" *ngIf="submitted">
      <mat-spinner diameter="50"></mat-spinner>
    </div>
  `,
  styles: [],
})
export class AirdropComponent {
  constructor(
    private readonly _eventApiService: EventApiService,
    private readonly _formBuilder: FormBuilder,
    private readonly _router: Router
  ) {}
  submitted = false;
  readonly airdropForm = this._formBuilder.group({
    pubkey: this._formBuilder.control(null, {
      validators: [Validators.required, Validators.maxLength(44)],
    }),
  });

  requestAirdrop(pubkey: string, amount: number) {
    this.submitted = true;
    this._eventApiService.airdrop(pubkey, amount).subscribe((data) => {
      this.submitted = false;
      if (data.status) {
        alert(amount + ' DISCO AIRDROP SUCCESS  🚀🚀');
      } else {
        alert('SOMETHING WENT WRONG 🛑🛑');
      }

      this._router.navigate(['/list-events']);
    });
  }

  onSubmit() {
    if (this.airdropForm.valid) {
      this.requestAirdrop(this.airdropForm.value.pubkey, 10);
    } else {
      alert('FORM INVALID');
    }
  }
}
