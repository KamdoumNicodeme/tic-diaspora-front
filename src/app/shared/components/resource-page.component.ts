import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { SharedResourceService } from '../../features/shared-resource.service';

export interface ResourceConfig {
  title: string;
  eyebrow: string;
  path: string;
  columns: { key: string; label: string }[];
}

@Component({
  selector: 'app-resource-page',
  standalone: true,
  templateUrl: './resource-page.component.html',
  styleUrl: './resource-page.component.css'
})
export class ResourcePageComponent implements OnInit {
  readonly config = input.required<ResourceConfig>();
  private readonly resources = inject(SharedResourceService);
  private readonly rawRows = signal<Record<string, unknown>[]>([]);
  protected readonly rows = computed(() => this.rawRows());

  ngOnInit(): void {
    this.resources.page<Record<string, unknown>>(this.config().path).subscribe((page) => this.rawRows.set(page.content));
  }

  protected value(row: Record<string, unknown>, key: string): string {
    const value = key.split('.').reduce<unknown>((current, part) => {
      if (current && typeof current === 'object' && part in current) {
        return (current as Record<string, unknown>)[part];
      }
      return undefined;
    }, row);
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    if (typeof value === 'number') {
      return new Intl.NumberFormat('fr-FR').format(value);
    }
    return String(value);
  }

  protected trackRow(index: number, row: Record<string, unknown>): unknown {
    return row['id'] ?? index;
  }
}
