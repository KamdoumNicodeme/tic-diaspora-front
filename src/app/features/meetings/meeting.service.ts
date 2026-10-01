import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Meeting, Page } from '../../core/models/api.models';
import { ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class MeetingService {
  private readonly api = inject(ApiService);

  list(): Observable<Page<Meeting>> {
    return this.api.page<Meeting>('/meetings', 0, 100);
  }

  get(id: string): Observable<Meeting> {
    return this.api.get<Meeting>(`/meetings/${id}`);
  }

  create(body: unknown): Observable<Meeting> {
    return this.api.post<Meeting>('/meetings', body);
  }

  generate(year: number): Observable<Meeting[]> {
    return this.api.post<Meeting[]>(`/meetings/generate?year=${year}`, {});
  }

  start(id: string): Observable<Meeting> {
    return this.api.patch<Meeting>(`/meetings/${id}/start`);
  }

  complete(id: string, body: unknown): Observable<Meeting> {
    return this.api.patch<Meeting>(`/meetings/${id}/complete`, body);
  }

  saveMinutes(id: string, body: unknown): Observable<Meeting> {
    return this.api.patch<Meeting>(`/meetings/${id}/minutes`, body);
  }

  assignChairperson(id: string): Observable<Meeting> {
    return this.api.patch<Meeting>(`/meetings/${id}/assign-chairperson`);
  }

  changeBeneficiary(id: string, beneficiaryId: string, secondaryBeneficiaryId = '', unanimousAgreement = false, reason = 'Bénéficiaire modifié depuis la réunion après accord unanime'): Observable<Meeting> {
    return this.api.patch<Meeting>(`/meetings/${id}/change-beneficiary`, {
      beneficiaryId,
      secondaryBeneficiaryId: secondaryBeneficiaryId || null,
      unanimousAgreement,
      reason
    });
  }
}
