import { Component } from '@angular/core';
import { ResourceConfig, ResourcePageComponent } from '../../shared/components/resource-page.component';

@Component({
  selector: 'app-decisions-page',
  standalone: true,
  imports: [ResourcePageComponent],
  templateUrl: './decisions-page.component.html',
  styleUrl: './decisions-page.component.css'
})
export class DecisionsPageComponent {
  protected readonly config: ResourceConfig = {
    eyebrow: 'Suivi',
    title: 'Décisions',
    path: '/decisions',
    columns: [
      { key: 'title', label: 'Titre' },
      { key: 'responsibleId', label: 'Responsable' },
      { key: 'dueDate', label: 'Échéance' },
      { key: 'status', label: 'Statut' },
      { key: 'priority', label: 'Priorité' }
    ]
  };
}
