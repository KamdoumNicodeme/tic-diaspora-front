import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Contribution, Member } from '../../core/models/api.models';
import { MemberService } from './member.service';
import { ContributionService } from '../contributions/contribution.service';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './member-detail.component.html',
  styleUrl: './member-detail.component.css'
})
export class MemberDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly members = inject(MemberService);
  private readonly contributionService = inject(ContributionService);
  protected readonly member = signal<Member | null>(null);
  protected readonly contributions = signal<Contribution[]>([]);

  ngOnInit(): void {
    this.reload();
  }

  suspend(id: string): void {
    this.members.suspend(id).subscribe((member) => this.member.set(member));
  }

  reactivate(id: string): void {
    this.members.reactivate(id).subscribe((member) => this.member.set(member));
  }

  openProof(proofUrl: string): void {
    this.contributionService.openProof(proofUrl);
  }

  protected paymentProvider(member: Member): string {
    return member.orangeMoneyNumber || member.orangeMoneyAccountName ? 'Orange Money' : 'MTN Money';
  }

  protected paymentNumber(member: Member): string {
    return member.orangeMoneyNumber || member.mtnMoneyNumber || '-';
  }

  protected paymentAccountName(member: Member): string {
    return member.orangeMoneyAccountName || member.mtnMoneyAccountName || '-';
  }

  private reload(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.members.get(id).subscribe((member) => this.member.set(member));
      this.members.contributions(id).subscribe((items) => this.contributions.set(items));
    }
  }
}
