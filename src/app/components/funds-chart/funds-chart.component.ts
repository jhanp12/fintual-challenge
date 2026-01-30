import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FintualService } from '../../services/fintual.service';
import { Fund } from '../../models/fund';
import { RealAsset, MonthlyVariation } from '../../models/real-asset';
import { Chart, registerables, ChartType } from 'chart.js';

Chart.register(...registerables);

interface FundStatistics {
  average: number;
  bestMonth: { month: string; variation: number };
  worstMonth: { month: string; variation: number };
  volatility: number;
  positiveMonths: number;
  negativeMonths: number;
}

@Component({
  selector: 'app-funds-chart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './funds-chart.component.html',
  styleUrl: './funds-chart.component.css'
})
export class FundsChartComponent implements OnInit {
  funds: Fund[] = [];
  selectedFund: number | null = null;
  selectedFunds: number[] = [];
  selectedType: string = '';
  filteredFunds: Fund[] = [];
  startDate: string = '';
  endDate: string = '';
  monthlyVariations: MonthlyVariation[] = [];
  allFundsVariations: Map<number, MonthlyVariation[]> = new Map();
  filteredVariations: MonthlyVariation[] = [];
  chart: Chart | null = null;
  loading: boolean = false;
  error: string = '';
  searchTerm: string = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  compareMode: boolean = false;
  chartType: ChartType = 'line';
  statistics: FundStatistics | null = null;

  fundTypes: string[] = ['Agresivo', 'Moderado', 'Conservador', 'Muy Conservador'];
  chartTypes: { value: ChartType; label: string; icon: string }[] = [
    { value: 'line', label: 'Línea', icon: '📈' },
    { value: 'bar', label: 'Barras', icon: '📊' },
    { value: 'radar', label: 'Radar', icon: '🎯' }
  ];

  constructor(private fintualService: FintualService) {}

  ngOnInit() {
    this.loadFunds();
  }

  loadFunds() {
    this.loading = true;
    this.fintualService.getFunds().subscribe({
      next: (response) => {
        this.funds = response.data;
        this.filteredFunds = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los fondos';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onFilterChange() {
    if (this.compareMode) {
      if (this.selectedFunds.length > 0) {
        this.loadMultipleFunds();
      }
    } else {
      if (this.selectedFund) {
        this.loadFundData();
      }
    }
  }

  onTypeChange() {
    if (this.selectedType) {
      this.filteredFunds = this.funds.filter(fund => fund.type === this.selectedType);
    } else {
      this.filteredFunds = this.funds;
    }
    
    if (this.selectedFund && !this.filteredFunds.find(f => f.id === this.selectedFund)) {
      this.selectedFund = null;
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
      this.monthlyVariations = [];
      this.filteredVariations = [];
      this.statistics = null;
    }
  }

  toggleCompareMode() {
    this.compareMode = !this.compareMode;
    this.selectedFunds = [];
    this.selectedFund = null;
    this.monthlyVariations = [];
    this.filteredVariations = [];
    this.allFundsVariations.clear();
    this.statistics = null;
    
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  toggleFundSelection(fundId: number) {
    const index = this.selectedFunds.indexOf(fundId);
    if (index > -1) {
      this.selectedFunds.splice(index, 1);
    } else {
      if (this.selectedFunds.length < 4) {
        this.selectedFunds.push(fundId);
      } else {
        alert('Máximo 4 fondos para comparar');
        return;
      }
    }
    
    if (this.selectedFunds.length > 0) {
      this.loadMultipleFunds();
    } else {
      this.monthlyVariations = [];
      this.filteredVariations = [];
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }
    }
  }

  isFundSelected(fundId: number): boolean {
    return this.selectedFunds.includes(fundId);
  }

  loadMultipleFunds() {
    this.loading = true;
    this.error = '';
    this.allFundsVariations.clear();
    
    let loadedCount = 0;
    const totalFunds = this.selectedFunds.length;

    this.selectedFunds.forEach(fundId => {
      this.fintualService.getFundData(
        fundId,
        this.startDate || undefined,
        this.endDate || undefined
      ).subscribe({
        next: (response) => {
          const data = response.data || response;
          const variations = this.calculateVariationsForFund(data, fundId);
          this.allFundsVariations.set(fundId, variations);
          
          loadedCount++;
          if (loadedCount === totalFunds) {
            this.createComparisonChart();
            this.loading = false;
          }
        },
        error: (err) => {
          this.error = 'Error al cargar datos de comparación';
          this.loading = false;
          console.error(err);
        }
      });
    });
  }

  calculateVariationsForFund(data: any[], fundId: number): MonthlyVariation[] {
    if (!data || data.length === 0) return [];

    let filteredData = data;
    if (this.startDate && this.endDate) {
      filteredData = data.filter(item => {
        const dateStr = item.attributes?.date || item.date;
        const itemDate = new Date(dateStr);
        return itemDate >= new Date(this.startDate) && itemDate <= new Date(this.endDate);
      });
    }

    if (filteredData.length === 0) return [];

    const monthlyData: { [key: string]: any[] } = {};
    
    filteredData.forEach(item => {
      const dateStr = item.attributes?.date || item.date;
      const priceValue = item.attributes?.price || item.price;
      
      if (!dateStr || priceValue === undefined || priceValue === null) return;
      
      const date = new Date(dateStr);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = [];
      }
      monthlyData[monthKey].push({ 
        date: dateStr, 
        price: parseFloat(priceValue.toString()) 
      });
    });

    const fundName = this.funds.find(f => f.id === fundId)?.name || '';

    return Object.keys(monthlyData).map(month => {
      const monthData = monthlyData[month].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      const firstPrice = monthData[0].price;
      const lastPrice = monthData[monthData.length - 1].price;
      const variation = ((lastPrice - firstPrice) / firstPrice) * 100;

      return {
        month,
        variation: parseFloat(variation.toFixed(2)),
        fundName
      };
    }).sort((a, b) => a.month.localeCompare(b.month));
  }

  loadFundData() {
    if (!this.selectedFund) return;

    this.loading = true;
    this.error = '';
    this.monthlyVariations = [];
    this.filteredVariations = [];
    this.statistics = null;

    this.fintualService.getFundData(
      this.selectedFund, 
      this.startDate || undefined, 
      this.endDate || undefined
    ).subscribe({
      next: (response) => {
        const data = response.data || response;
        
        if (!data || data.length === 0) {
          this.error = 'No hay datos disponibles para este fondo';
          this.loading = false;
          return;
        }
        
        this.calculateMonthlyVariations(data);
        
        if (this.monthlyVariations.length > 0) {
          this.filteredVariations = [...this.monthlyVariations];
          this.calculateStatistics();
          this.createChart();
        } else {
          this.error = 'No se pudieron calcular las variaciones mensuales';
        }
        
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los datos del fondo';
        this.loading = false;
        console.error('Error completo:', err);
      }
    });
  }

  calculateMonthlyVariations(data: any[]) {
    if (!data || data.length === 0) {
      this.error = 'No hay datos disponibles para este fondo';
      return;
    }

    let filteredData = data;
    if (this.startDate && this.endDate) {
      filteredData = data.filter(item => {
        const dateStr = item.attributes?.date || item.date;
        const itemDate = new Date(dateStr);
        return itemDate >= new Date(this.startDate) && itemDate <= new Date(this.endDate);
      });
    }

    if (filteredData.length === 0) {
      this.error = 'No hay datos para el rango de fechas seleccionado';
      return;
    }

    const monthlyData: { [key: string]: any[] } = {};
    
    filteredData.forEach(item => {
      const dateStr = item.attributes?.date || item.date;
      const priceValue = item.attributes?.price || item.price;
      
      if (!dateStr || priceValue === undefined || priceValue === null) return;
      
      const date = new Date(dateStr);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = [];
      }
      monthlyData[monthKey].push({ 
        date: dateStr, 
        price: parseFloat(priceValue.toString()) 
      });
    });

    this.monthlyVariations = Object.keys(monthlyData).map(month => {
      const monthData = monthlyData[month].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      const firstPrice = monthData[0].price;
      const lastPrice = monthData[monthData.length - 1].price;
      const variation = ((lastPrice - firstPrice) / firstPrice) * 100;

      const fundName = this.funds.find(f => f.id === this.selectedFund)?.name || '';

      return {
        month,
        variation: parseFloat(variation.toFixed(2)),
        fundName
      };
    }).sort((a, b) => a.month.localeCompare(b.month));
  }

  calculateStatistics() {
    if (this.monthlyVariations.length === 0) {
      this.statistics = null;
      return;
    }

    const variations = this.monthlyVariations.map(v => v.variation);
    const average = variations.reduce((a, b) => a + b, 0) / variations.length;
    
    const sortedVariations = [...this.monthlyVariations].sort((a, b) => b.variation - a.variation);
    const bestMonth = sortedVariations[0];
    const worstMonth = sortedVariations[sortedVariations.length - 1];
    
    const squaredDiffs = variations.map(v => Math.pow(v - average, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / variations.length;
    const volatility = Math.sqrt(variance);
    
    const positiveMonths = variations.filter(v => v > 0).length;
    const negativeMonths = variations.filter(v => v < 0).length;

    this.statistics = {
      average: parseFloat(average.toFixed(2)),
      bestMonth: { month: bestMonth.month, variation: bestMonth.variation },
      worstMonth: { month: worstMonth.month, variation: worstMonth.variation },
      volatility: parseFloat(volatility.toFixed(2)),
      positiveMonths,
      negativeMonths
    };
  }

  changeChartType(type: ChartType) {
    this.chartType = type;
    if (this.compareMode && this.selectedFunds.length > 0) {
      this.createComparisonChart();
    } else if (!this.compareMode && this.monthlyVariations.length > 0) {
      this.createChart();
    }
  }

  createChart() {
    if (this.chart) {
      this.chart.destroy();
    }

    setTimeout(() => {
      const ctx = document.getElementById('myChart') as HTMLCanvasElement;
      
      if (!ctx) {
        console.error('No se encontró el elemento canvas');
        return;
      }
      
      this.chart = new Chart(ctx, {
        type: this.chartType,
        data: {
          labels: this.monthlyVariations.map(v => v.month),
          datasets: [{
            label: 'Variación Mensual (%)',
            data: this.monthlyVariations.map(v => v.variation),
            borderColor: 'rgb(102, 126, 234)',
            backgroundColor: this.chartType === 'line' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.7)',
            tension: 0.4,
            fill: this.chartType === 'line',
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: 'rgb(102, 126, 234)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            title: {
              display: true,
              text: 'Variación Mensual del Fondo',
              font: {
                size: 18,
                weight: 'bold'
              },
              padding: 20
            },
            legend: {
              display: true,
              position: 'top'
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              titleFont: {
                size: 14
              },
              bodyFont: {
                size: 13
              }
            }
          },
          scales: this.chartType !== 'radar' ? {
            y: {
              beginAtZero: false,
              title: {
                display: true,
                text: 'Variación (%)',
                font: {
                  size: 14,
                  weight: 'bold'
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Mes',
                font: {
                  size: 14,
                  weight: 'bold'
                }
              },
              grid: {
                display: false
              }
            }
          } : undefined
        }
      });
    }, 100);
  }

  createComparisonChart() {
    if (this.chart) {
      this.chart.destroy();
    }

    setTimeout(() => {
      const ctx = document.getElementById('myChart') as HTMLCanvasElement;
      
      if (!ctx) {
        console.error('No se encontró el elemento canvas');
        return;
      }

      const allMonths = new Set<string>();
      this.allFundsVariations.forEach(variations => {
        variations.forEach(v => allMonths.add(v.month));
      });
      const sortedMonths = Array.from(allMonths).sort();

      const colors = [
        { border: 'rgb(102, 126, 234)', bg: 'rgba(102, 126, 234, 0.1)' },
        { border: 'rgb(234, 102, 126)', bg: 'rgba(234, 102, 126, 0.1)' },
        { border: 'rgb(126, 234, 102)', bg: 'rgba(126, 234, 102, 0.1)' },
        { border: 'rgb(234, 179, 102)', bg: 'rgba(234, 179, 102, 0.1)' }
      ];

      const datasets = Array.from(this.allFundsVariations.entries()).map(([fundId, variations], index) => {
        const fundName = this.funds.find(f => f.id === fundId)?.name || '';
        const data = sortedMonths.map(month => {
          const variation = variations.find(v => v.month === month);
          return variation ? variation.variation : null;
        });

        return {
          label: fundName,
          data: data,
          borderColor: colors[index].border,
          backgroundColor: this.chartType === 'line' ? colors[index].bg : colors[index].border.replace('rgb', 'rgba').replace(')', ', 0.7)'),
          tension: 0.4,
          fill: this.chartType === 'line',
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: colors[index].border,
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        };
      });

      this.chart = new Chart(ctx, {
        type: this.chartType,
        data: {
          labels: sortedMonths,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            title: {
              display: true,
              text: 'Comparación de Fondos - Variación Mensual',
              font: {
                size: 18,
                weight: 'bold'
              },
              padding: 20
            },
            legend: {
              display: true,
              position: 'top'
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              titleFont: {
                size: 14
              },
              bodyFont: {
                size: 13
              }
            }
          },
          scales: this.chartType !== 'radar' ? {
            y: {
              beginAtZero: false,
              title: {
                display: true,
                text: 'Variación (%)',
                font: {
                  size: 14,
                  weight: 'bold'
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Mes',
                font: {
                  size: 14,
                  weight: 'bold'
                }
              },
              grid: {
                display: false
              }
            }
          } : undefined
        }
      });
    }, 100);
  }

  filterTable() {
    if (!this.searchTerm) {
      this.filteredVariations = [...this.monthlyVariations];
      return;
    }

    this.filteredVariations = this.monthlyVariations.filter(variation =>
      variation.month.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  clearSearch() {
    this.searchTerm = '';
    this.filterTable();
  }

  sortBy(column: 'month' | 'variation') {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredVariations.sort((a, b) => {
      let comparison = 0;
      
      if (column === 'month') {
        comparison = a.month.localeCompare(b.month);
      } else {
        comparison = a.variation - b.variation;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }
}