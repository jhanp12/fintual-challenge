import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FundsChartComponent } from './components/funds-chart/funds-chart.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FundsChartComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'fintual-challenge';
}