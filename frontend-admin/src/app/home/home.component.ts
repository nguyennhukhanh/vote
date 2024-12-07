import type { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CountUp } from 'countup.js';

import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
})
export class HomeComponent implements OnInit {
  totalContests: number = 0;
  activeContests: number = 0;
  totalVotes: number = 0;
  totalParticipants: number = 0;

  private counters: CountUp[] = [];

  constructor() {}

  ngOnInit() {
    this.initCounters();

    this.observeStats();
  }

  private initCounters() {
    const options = {
      duration: 2.5,
      useEasing: true,
      useGrouping: true,
    };

    this.counters = [
      new CountUp('totalContests', this.totalContests, { ...options }),
      new CountUp('activeContests', this.activeContests, { ...options }),
      new CountUp('totalVotes', this.totalVotes, { ...options }),
      new CountUp('totalParticipants', this.totalParticipants, { ...options }),
    ];
  }

  private observeStats() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.counters.forEach((counter) => {
              if (!counter.error) {
                counter.start();
              }
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 },
    );

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
      observer.observe(statsSection);
    }
  }
}
