// Angular Core
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

// Chart.js and ng2-charts
import { Chart, ChartConfiguration, ChartData, ChartType, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import annotationPlugin from 'chartjs-plugin-annotation';
Chart.register(annotationPlugin);

// Application Services
import { MessageService } from '../../services/message.service';
import { ResearchService } from '../../services/research.service';

// Application Models
import { Question, Research } from '../../models/research.model';

// Application Utilities
import { ApplicationUtils } from '../../utils/application-utils';

@Component({
    selector: 'app-research-results',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        BaseChartDirective,
        MatTableModule
    ],
    templateUrl: './research-results.component.html',
    styleUrls: ['./research-results.component.css'],
})
export class ResearchResultsComponent implements OnInit {
    @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
    research!: Research;

    chartData: { [key: number]: ChartData } = {};
    chartOptions: { [key: number]: ChartConfiguration['options'] } = {};
    chartTypes: { [key: number]: ChartType } = {};

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private researchService: ResearchService,
        private messageService: MessageService,
        private applicationUtils: ApplicationUtils
    ) { Chart.register(...registerables); }

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        this.loadResearch(id);
    }

    loadResearch(id: number): void {
        this.researchService.getResearchResults(id).subscribe({
            next: async (research) => {
                this.research = research;
                this.generateCharts();
            },
            error: (err) => {
                console.error('Erro ao carregar pesquisa', err);

                let errorMessage = this.applicationUtils.getMessageError(err);
                this.messageService.showError('Erro ao carregar a pesquisa: ' + errorMessage || '');
            },
        });
    }

    goBack(): void {
        this.router.navigate(['/pesquisas']);
    }

    generateCharts(): void {
        this.research.questions.forEach(question => {
            if (question.answerType === 'ESCALA_NUMERICA') {
                this.generateHorizontalBarChart(question);
            } else if (question.answerType === 'SIM_NAO') {
                this.generatePieChart(question);
            }
        });
    }

    async generatePieChart(question: Question): Promise<void> {
        const avg = Number(question.sum) / question.totalAnswers;
        const value = Math.min(Math.max(avg, 0), 1);

        this.chartTypes[question.id] = 'pie';

        // Dados do gráfico
        this.chartData[question.id] = {
            labels: ['Sim', 'Não'],
            datasets: [{
                data: [value, 1 - value],
                backgroundColor: [
                    '#2ecc71', // verde — Sim
                    '#e74c3c'  // vermelho — Não
                ],
                borderWidth: 2,
            }],
        };

        // Configurações do gráfico
        this.chartOptions[question.id] = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${(value * 100).toFixed(0).replace(".", ",")}% Sim, ${((1 - value) * 100).toFixed(0).replace(".", ",")}% Não`,
                    font: { size: 16, weight: 'bold' },
                },
                legend: {
                    display: true,
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.label || '';
                            const percent = (context.parsed * 100).toFixed(1);
                            return `${label}: ${percent}%`;
                        },
                    },
                },
            },
        };
    }


    async generateHorizontalBarChart(question: Question): Promise<void> {
        const avg = Number(question.sum) / question.totalAnswers;
        const maxValue = 10;

        this.chartTypes[question.id] = 'bar';

        // Faixas de cores fixas
        let segments: { value: number; color: string; label: string }[] = [];

        segments = [
            { value: 1, color: '#e74c3c', label: '0' },
            { value: 1, color: '#e74c3c', label: '1' },
            { value: 1, color: '#e74c3c', label: '2' },
            { value: 1, color: '#e67e22', label: '3' },
            { value: 1, color: '#e67e22', label: '4' },
            { value: 1, color: '#f1c40f', label: '5' },
            { value: 1, color: '#f1c40f', label: '6' },
            { value: 1, color: '#c1cc2eff', label: '7' },
            { value: 1, color: '#c1cc2eff', label: '8' },
            { value: 1, color: '#2ecc71', label: '9' },
            { value: 1, color: '#2ecc71', label: '10' }
        ];


        this.chartData[question.id] = {
            labels: [''],
            datasets: segments.map((seg) => ({
                data: [maxValue],
                stack: 'combined',
                label: '',
                borderWidth: 0,
                backgroundColor: (context: { chart: any; }) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return null;
                    const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
                    gradient.addColorStop(0, '#e74c3c');   // Vermelho - Discordo totalmente
                    gradient.addColorStop(0.25, '#e67e22'); // Laranja
                    gradient.addColorStop(0.5, '#f1c40f');  // Amarelo - Indiferente
                    gradient.addColorStop(0.75, '#c1cc2e'); // Amarelo-esverdeado
                    gradient.addColorStop(1, '#2ecc71');    // Verde - Concordo totalmente
                    return gradient;
                }
            })),
        };

        this.chartOptions[question.id] = {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                title: {
                    display: true,
                    text: `Média: ${avg.toFixed(2).replace(".", ",")} - ${getLabel(avg)}`,
                    font: { size: 16, weight: 'bold' },
                },
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        generateLabels: () => [
                            { text: 'Discordo totalmente', fillStyle: '#e74c3c' },
                            { text: 'Indiferente', fillStyle: '#f1c40f' },
                            { text: 'Concordo totalmente', fillStyle: '#2ecc71' },
                        ],
                    },
                },
                tooltip: {
                    enabled: false, // não precisamos de tooltip
                },
                annotation: {
                    annotations: {
                        avgLine: {
                            type: 'line',
                            xMin: avg,
                            xMax: avg,
                            borderColor: 'black',
                            borderWidth: 3,
                            label: {
                                content: `Resultado: ${avg.toFixed(2)}`,
                                position: 'end',
                            },
                        },
                    },
                },
            },
            scales: {
                x: {
                    stacked: true,
                    min: 0,
                    max: maxValue,
                    ticks: { stepSize: 1, display: false },
                },
                y: {
                    stacked: true,
                },
            },
        };
    }


    getChartType(questionId: number): ChartType {
        return this.chartTypes[questionId] || 'bar';
    }

    getChartData(questionId: number): ChartData {
        return this.chartData[questionId];
    }

    getChartOptions(questionId: number): ChartConfiguration['options'] {
        return this.chartOptions[questionId];
    }

    trackByQuestionId(index: number, question: Question): number {
        return question.id;
    }

    getTotalParticipants(): number {
        if (!this.research || !this.research.questions || this.research.questions.length === 0) {
            return 0;
        }
        return Math.max(...this.research.questions.map(q => q.totalAnswers));
    }
}
function getLabel(avg: number): any {
    console.log(avg);
    if (avg <= 2.5) {
        return 'Discordo totalmente';
    } else if (avg <= 7.5) {
        return 'Indiferente';
    }
    return "Concordo totalmente";
}

