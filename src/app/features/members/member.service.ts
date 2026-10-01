import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Contribution, Member, Page } from '../../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class MemberService {
  private readonly api = inject(ApiService);

  list(): Observable<Page<Member>> {
    return this.api.page<Member>('/members', 0, 100);
  }

  get(id: string): Observable<Member> {
    return this.api.get<Member>(`/members/${id}`);
  }

  create(body: unknown): Observable<Member> {
    return this.api.post<Member>('/members', body);
  }

  update(id: string, body: unknown): Observable<Member> {
    return this.api.put<Member>(`/members/${id}`, body);
  }

  updateMe(body: unknown): Observable<Member> {
    return this.api.patch<Member>('/members/me', body);
  }

  suspend(id: string): Observable<Member> {
    return this.api.patch<Member>(`/members/${id}/suspend`);
  }

  reactivate(id: string): Observable<Member> {
    return this.api.patch<Member>(`/members/${id}/reactivate`);
  }

  contributions(id: string): Observable<Contribution[]> {
    return this.api.get<Contribution[]>(`/members/${id}/contributions`);
  }
}
