import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Contribution, Page, PaymentMethod } from '../../core/models/api.models';
import { ApiService } from '../../core/services/api.service';

export interface ContributionPaymentForm {
  cycleId: string;
  memberId: string;
  amount: number;
  method: PaymentMethod;
  transactionReference?: string;
}

@Injectable({ providedIn: 'root' })
export class ContributionService {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);

  list(): Observable<Page<Contribution>> {
    return this.api.page<Contribution>('/contributions', 0, 100);
  }

  recordPayment(body: unknown): Observable<Contribution> {
    return this.api.post<Contribution>('/contributions', body);
  }

  memberContributions(memberId: string): Observable<Contribution[]> {
    return this.api.get<Contribution[]>(`/members/${memberId}/contributions`);
  }

  recordPaymentWithProof(body: ContributionPaymentForm, proof: File | null): Observable<Contribution> {
    const form = new FormData();
    form.append('cycleId', body.cycleId);
    form.append('memberId', body.memberId);
    form.append('amount', String(body.amount));
    form.append('method', body.method);
    if (body.transactionReference?.trim()) {
      form.append('transactionReference', body.transactionReference.trim());
    }
    if (proof) {
      form.append('proof', proof, proof.name);
    }
    return this.api.post<Contribution>('/contributions', form);
  }

  validate(id: string): Observable<Contribution> {
    return this.api.patch<Contribution>(`/contributions/${id}/validate`);
  }

  openProof(path: string): void {
    const url = path.startsWith('http') ? path : this.api.url(path);
    this.http.get(url, { responseType: 'blob' }).subscribe((blob) => {
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, '_blank', 'noopener');
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    });
  }
}
