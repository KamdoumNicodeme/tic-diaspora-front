import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Contribution, Page, TontineCycle } from '../../core/models/api.models';
import { ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class TontineService {
  private readonly api = inject(ApiService);

  list(): Observable<Page<TontineCycle>> {
    return this.api.page<TontineCycle>('/tontine-cycles', 0, 100);
  }

  get(id: string): Observable<TontineCycle> {
    return this.api.get<TontineCycle>(`/tontine-cycles/${id}`);
  }

  create(body: unknown): Observable<TontineCycle> {
    return this.api.post<TontineCycle>('/tontine-cycles', body);
  }

  contributions(id: string): Observable<Contribution[]> {
    return this.api.get<Contribution[]>(`/tontine-cycles/${id}/contributions`);
  }

  open(id: string): Observable<TontineCycle> {
    return this.api.patch<TontineCycle>(`/tontine-cycles/${id}/open`);
  }

  close(id: string): Observable<TontineCycle> {
    return this.api.patch<TontineCycle>(`/tontine-cycles/${id}/close`);
  }

  changeBeneficiary(id: string, beneficiaryId: string, secondaryBeneficiaryId = '', unanimousAgreement = false, reason = 'Changement de bénéficiaire après accord unanime'): Observable<TontineCycle> {
    return this.api.patch<TontineCycle>(`/tontine-cycles/${id}/change-beneficiary`, {
      beneficiaryId,
      secondaryBeneficiaryId: secondaryBeneficiaryId || null,
      unanimousAgreement,
      reason
    });
  }
}
