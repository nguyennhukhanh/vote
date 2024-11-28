import type { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { CountUp } from 'countup.js';

import { ContestComponent } from '../contest/contest.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, ContestComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
})
export class HomeComponent implements OnInit {
  totalContests: number = 150;
  activeContests: number = 42;
  totalVotes: number = 25639;
  totalParticipants: number = 12890;

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
