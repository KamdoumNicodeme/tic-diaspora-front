import { Component, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ThemeService } from '../theme/theme.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  section: 'pilotage' | 'association' | 'finance' | 'suivi';
  accent: 'mint' | 'violet' | 'orange' | 'coral' | 'ocean';
  presidentOnly?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [NgClass, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.css'
})
export class AppShellComponent {
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  protected readonly menuOpen = signal(false);

  private readonly nav: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: 'DB', section: 'pilotage', accent: 'mint' },
    { label: 'Réunions', path: '/meetings', icon: 'RE', section: 'pilotage', accent: 'violet' },
    { label: 'Présences', path: '/attendance', icon: 'PR', section: 'pilotage', accent: 'orange', presidentOnly: true },
    { label: "Demandes d'absence", path: '/absence-requests', icon: 'AB', section: 'pilotage', accent: 'coral' },
    { label: 'Membres', path: '/members', icon: 'MB', section: 'association', accent: 'mint', presidentOnly: true },
    { label: 'Projets', path: '/projects', icon: 'PJ', section: 'association', accent: 'ocean' },
    { label: 'Décisions', path: '/decisions', icon: 'DC', section: 'association', accent: 'violet' },
    { label: 'Tontine', path: '/tontine', icon: 'TO', section: 'finance', accent: 'mint' },
    { label: 'Cotisations', path: '/contributions', icon: 'CO', section: 'finance', accent: 'orange' },
    { label: 'Bénéficiaires', path: '/beneficiaries', icon: 'BE', section: 'finance', accent: 'violet' },
    { label: 'Pénalités', path: '/penalties', icon: 'PE', section: 'finance', accent: 'coral' },
    { label: 'Caisse caritative', path: '/charity-fund', icon: 'CA', section: 'finance', accent: 'ocean', presidentOnly: true },
    { label: 'Rapports', path: '/reports', icon: 'RA', section: 'suivi', accent: 'mint', presidentOnly: true },
    { label: 'Notifications', path: '/notifications', icon: 'NO', section: 'suivi', accent: 'orange' },
    { label: 'Profil', path: '/profile', icon: 'PF', section: 'suivi', accent: 'violet' }
  ];

  protected readonly roleLabel = computed(() => (this.auth.isPresident() ? 'Président' : 'Membre'));

  protected readonly userInitials = computed(() => {
    const email = this.auth.token()?.email ?? 'tic@diaspora';
    return email
      .split('@')[0]
      .split(/[.\-_]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'TD';
  });

  protected readonly navSections = computed<NavSection[]>(() => {
    const visibleItems = this.nav.filter((item) => !item.presidentOnly || this.auth.isPresident());
    return [
      { title: 'Pilotage', items: visibleItems.filter((item) => item.section === 'pilotage') },
      { title: 'Association', items: visibleItems.filter((item) => item.section === 'association') },
      { title: 'Finance', items: visibleItems.filter((item) => item.section === 'finance') },
      { title: 'Suivi', items: visibleItems.filter((item) => item.section === 'suivi') }
    ].filter((section) => section.items.length > 0);
  });

  protected accentClass(item: NavItem): string {
    return {
      mint: 'bg-mint/[0.12] text-mint ring-mint/20 group-hover:bg-mint group-hover:text-white',
      violet: 'bg-plum/[0.12] text-plum ring-plum/20 group-hover:bg-plum group-hover:text-white',
      orange: 'bg-saffron/15 text-stone-800 ring-saffron/25 group-hover:bg-saffron group-hover:text-white dark:text-amber-100',
      coral: 'bg-coral/[0.12] text-coral ring-coral/20 group-hover:bg-coral group-hover:text-white',
      ocean: 'bg-ocean/[0.12] text-ocean ring-ocean/20 group-hover:bg-ocean group-hover:text-white'
    }[item.accent];
  }
}
