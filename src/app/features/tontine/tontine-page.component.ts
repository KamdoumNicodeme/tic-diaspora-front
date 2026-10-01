import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Member, TontineCycle } from '../../core/models/api.models';
import { AuthService } from '../../core/auth/auth.service';
import { MemberService } from '../members/member.service';
import { TontineService } from './tontine.service';

@Component({
  selector: 'app-tontine-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './tontine-page.component.html',
  styleUrl: './tontine-page.component.css'
})
export class TontinePageComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly tontine = inject(TontineService);
  private readonly membersService = inject(MemberService);
  private readonly fb = inject(FormBuilder);
  protected readonly cycles = signal<TontineCycle[]>([]);
  protected readonly members = signal<Member[]>([]);
  protected readonly form = this.fb.nonNullable.group({
    month: [new Date().getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
    year: [new Date().getFullYear(), Validators.required],
    beneficiaryId: [''],
    secondaryBeneficiaryId: [''],
    comment: ['']
  });

  ngOnInit(): void {
    this.load();
    if (this.auth.isPresident()) {
      this.membersService.list().subscribe((page) => this.members.set(page.content));
    }
  }

  create(): void {
    const raw = this.form.getRawValue();
    this.tontine.create({
      ...raw,
      beneficiaryId: raw.beneficiaryId || null,
      secondaryBeneficiaryId: this.isPrimaryBeneficiary50000() ? raw.secondaryBeneficiaryId || null : null
    }).subscribe(() => this.load());
  }

  protected onPrimaryBeneficiaryChange(): void {
    this.syncSecondaryBeneficiaryControl();
  }

  protected isPrimaryBeneficiary50000(): boolean {
    const primaryId = this.form.controls.beneficiaryId.value;
    if (!primaryId) {
      return false;
    }
    return this.members().some((member) => member.id === primaryId && member.contributionType === 'XAF_50000');
  }

  protected eligibleSecondaryBeneficiaries(): Member[] {
    const primaryId = this.form.controls.beneficiaryId.value;
    return this.members().filter((member) => member.contributionType === 'XAF_50000' && member.id !== primaryId);
  }

  protected money(value: number): string {
    return new Intl.NumberFormat('fr-FR').format(value) + ' XAF';
  }

  protected beneficiaryNames(cycle: TontineCycle): string {
    return [cycle.beneficiaryFullName, cycle.secondaryBeneficiaryFullName].filter(Boolean).join(' + ') || '-';
  }

  private load(): void {
    this.tontine.list().subscribe((page) => this.cycles.set(page.content));
  }

  private syncSecondaryBeneficiaryControl(): void {
    const control = this.form.controls.secondaryBeneficiaryId;
    if (this.isPrimaryBeneficiary50000()) {
      control.setValidators([Validators.required]);
    } else {
      control.setValue('');
      control.clearValidators();
    }
    control.updateValueAndValidity({ emitEvent: false });
  }
}
