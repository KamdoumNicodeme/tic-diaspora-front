import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Meeting } from '../../core/models/api.models';
import { MeetingService } from './meeting.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-meetings-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './meetings-page.component.html',
  styleUrl: './meetings-page.component.css'
})
export class MeetingsPageComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly meetingsService = inject(MeetingService);
  protected readonly meetings = signal<Meeting[]>([]);

  ngOnInit(): void {
    this.load();
  }

  generate(): void {
    this.meetingsService.generate(new Date().getFullYear()).subscribe(() => this.load());
  }

  assign(id: string): void {
    this.meetingsService.assignChairperson(id).subscribe(() => this.load());
  }

  protected beneficiaryNames(meeting: Meeting): string {
    return [meeting.beneficiaryFullName, meeting.secondaryBeneficiaryFullName].filter(Boolean).join(' + ') || 'À définir';
  }

  private load(): void {
    this.meetingsService.list().subscribe((page) => this.meetings.set(page.content));
  }
}
