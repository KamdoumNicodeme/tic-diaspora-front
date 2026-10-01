import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { Member } from '../../core/models/api.models';
import { MemberService } from '../members/member.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly members = inject(MemberService);
  private readonly fb = inject(FormBuilder);
  protected readonly member = signal<Member | null>(null);
  protected readonly saving = signal(false);
  protected readonly changingPassword = signal(false);
  protected readonly message = signal('');
  protected readonly error = signal('');
  protected readonly passwordMessage = signal('');
  protected readonly passwordError = signal('');

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: [''],
    country: [''],
    city: [''],
    fullAddress: [''],
    photoUrl: [''],
    emergencyContactName: [''],
    emergencyContactPhone: [''],
    mobileMoneyProvider: ['ORANGE_MONEY', Validators.required],
    mobileMoneyNumber: [''],
    mobileMoneyAccountName: ['']
  });

  protected readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  ngOnInit(): void {
    const memberId = this.auth.token()?.memberId;
    if (!memberId) {
      return;
    }
    this.members.get(memberId).subscribe((member) => {
      this.member.set(member);
      this.form.patchValue({
        firstName: member.firstName,
        lastName: member.lastName,
        phone: member.phone ?? '',
        country: member.country ?? '',
        city: member.city ?? '',
        fullAddress: member.fullAddress ?? '',
        photoUrl: member.photoUrl ?? '',
        emergencyContactName: member.emergencyContactName ?? '',
        emergencyContactPhone: member.emergencyContactPhone ?? '',
        mobileMoneyProvider: member.mtnMoneyNumber || member.mtnMoneyAccountName ? 'MTN_MONEY' : 'ORANGE_MONEY',
        mobileMoneyNumber: member.orangeMoneyNumber || member.mtnMoneyNumber || '',
        mobileMoneyAccountName: member.orangeMoneyAccountName || member.mtnMoneyAccountName || ''
      });
    });
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }
    this.saving.set(true);
    this.message.set('');
    this.error.set('');
    this.members.updateMe(this.toPayload()).subscribe({
      next: (member) => {
        this.member.set(member);
        this.message.set('Profil mis à jour.');
        this.saving.set(false);
      },
      error: () => {
        this.error.set('Modification impossible. Vérifiez les informations.');
        this.saving.set(false);
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordError.set('Tous les champs sont obligatoires et le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    const raw = this.passwordForm.getRawValue();
    if (raw.newPassword !== raw.confirmPassword) {
      this.passwordError.set('La confirmation du nouveau mot de passe ne correspond pas.');
      return;
    }
    this.changingPassword.set(true);
    this.passwordMessage.set('');
    this.passwordError.set('');
    this.auth.changePassword(raw.currentPassword, raw.newPassword, raw.confirmPassword).subscribe({
      next: () => {
        this.passwordForm.reset();
        this.passwordMessage.set('Mot de passe mis à jour.');
        this.changingPassword.set(false);
      },
      error: () => {
        this.passwordError.set('Modification impossible. Vérifiez votre mot de passe actuel.');
        this.changingPassword.set(false);
      }
    });
  }

  private toPayload(): Record<string, unknown> {
    const raw = this.form.getRawValue();
    const isOrange = raw.mobileMoneyProvider === 'ORANGE_MONEY';
    return {
      firstName: raw.firstName,
      lastName: raw.lastName,
      phone: raw.phone,
      country: raw.country,
      city: raw.city,
      fullAddress: raw.fullAddress,
      photoUrl: raw.photoUrl,
      emergencyContactName: raw.emergencyContactName,
      emergencyContactPhone: raw.emergencyContactPhone,
      orangeMoneyNumber: isOrange ? raw.mobileMoneyNumber : '',
      orangeMoneyAccountName: isOrange ? raw.mobileMoneyAccountName : '',
      mtnMoneyNumber: isOrange ? '' : raw.mobileMoneyNumber,
      mtnMoneyAccountName: isOrange ? '' : raw.mobileMoneyAccountName
    };
  }
}
