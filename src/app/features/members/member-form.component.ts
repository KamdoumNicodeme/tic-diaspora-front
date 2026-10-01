import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MemberService } from './member.service';

@Component({
  selector: 'app-member-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './member-form.component.html',
  styleUrl: './member-form.component.css'
})
export class MemberFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly members = inject(MemberService);
  private readonly router = inject(Router);
  protected readonly saving = signal(false);
  protected readonly error = signal('');

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    country: [''],
    city: [''],
    fullAddress: [''],
    mobileMoneyProvider: ['ORANGE_MONEY', Validators.required],
    mobileMoneyNumber: [''],
    mobileMoneyAccountName: [''],
    joinedAt: [new Date().toISOString().slice(0, 10), Validators.required],
    role: ['MEMBER', Validators.required],
    contributionType: ['XAF_50000', Validators.required],
    temporaryPassword: ['ChangeMe123!']
  });

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.saving.set(true);
    this.members.create(this.toPayload()).subscribe({
      next: (member) => void this.router.navigate(['/members', member.id]),
      error: () => {
        this.error.set('Création impossible. Vérifiez les champs et l’email.');
        this.saving.set(false);
      }
    });
  }

  cancel(): void {
    void this.router.navigateByUrl('/members');
  }

  private toPayload(): Record<string, unknown> {
    const raw = this.form.getRawValue();
    const isOrange = raw.mobileMoneyProvider === 'ORANGE_MONEY';
    return {
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      phone: raw.phone,
      country: raw.country,
      city: raw.city,
      fullAddress: raw.fullAddress,
      orangeMoneyNumber: isOrange ? raw.mobileMoneyNumber : '',
      orangeMoneyAccountName: isOrange ? raw.mobileMoneyAccountName : '',
      mtnMoneyNumber: isOrange ? '' : raw.mobileMoneyNumber,
      mtnMoneyAccountName: isOrange ? '' : raw.mobileMoneyAccountName,
      joinedAt: raw.joinedAt,
      role: raw.role,
      contributionType: raw.contributionType,
      temporaryPassword: raw.temporaryPassword
    };
  }
}
