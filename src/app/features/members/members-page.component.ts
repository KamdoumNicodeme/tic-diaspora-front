import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Member } from '../../core/models/api.models';
import { MemberService } from './member.service';

@Component({
  selector: 'app-members-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './members-page.component.html',
  styleUrl: './members-page.component.css'
})
export class MembersPageComponent implements OnInit {
  private readonly membersService = inject(MemberService);
  protected readonly members = signal<Member[]>([]);

  ngOnInit(): void {
    this.membersService.list().subscribe((page) => this.members.set(page.content));
  }
}
