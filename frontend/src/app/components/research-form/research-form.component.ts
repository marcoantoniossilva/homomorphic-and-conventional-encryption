// Angular Core
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

// Application Services
import { CourseService } from '../../services/course.service';
import { MessageService } from '../../services/message.service';
import { ResearchService } from '../../services/research.service';

// Application Models
import { Research } from '../../models/research.model';

// Application Utilities
import { ApplicationUtils } from '../../utils/application-utils';


@Component({
    selector: 'app-research-form',
    standalone: true,
    templateUrl: './research-form.component.html',
    styleUrls: ['./research-form.component.css'],
    imports: [CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatIconModule,
        MatButtonModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCardModule,
        MatDividerModule]
})
export class ResearchFormComponent implements OnInit {
    researchForm!: FormGroup;
    formAction: 'create' | 'update' | 'view' = 'create';
    courses: any[] = [];
    today = new Date();

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private courseService: CourseService,
        private researchService: ResearchService,
        private messageService: MessageService,
        private route: ActivatedRoute,
        private applicationUtils: ApplicationUtils
    ) { }

    ngOnInit(): void {
        this.formAction = this.route.snapshot.data['formAction'] || 'create';

        this.researchForm = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(3)]],
            courseId: [null, Validators.required],
            deadlineDate: [null, Validators.required],
            deadlineTime: [null, Validators.required],
            questions: this.fb.array([])
        });

        this.addQuestion(); // Inicia com uma pergunta
        this.loadCourses();

        if (this.formAction === 'view' || this.formAction === 'update') {
            const id = this.route.snapshot.paramMap.get('id');
            if (id) {
                this.loadResearchById(Number(id));
            }
        }

        if (this.formAction === 'view') {
            this.researchForm.disable(); // Desabilita o formulário para modo visualização
            this.questionsFormArray.controls.forEach(group => group.disable()); // Desabilita as questões para modo visualização
        }
    }

    get questions(): FormArray {
        return this.researchForm.get('questions') as FormArray;
    }

    addQuestion(): void {
        this.questions.push(
            this.fb.group({
                text: ['', Validators.required],
                answerType: ['ESCALA_NUMERICA', Validators.required]
            })
        );
    }

    removeQuestion(index: number): void {
        this.questions.removeAt(index);
    }

    goBack(): void {
        this.router.navigate(['/pesquisas']);
    }

    loadResearchById(id: number): void {
        this.researchService.getById(id).subscribe({
            next: (research) => {
                // 1. Primeiro, limpa o form array atual se necessário
                this.questionsFormArray.clear();

                const deadline = new Date(research.deadline);
                const hours = deadline.getHours().toString().padStart(2, '0');
                const minutes = deadline.getMinutes().toString().padStart(2, '0');
                const formattedTime = `${hours}:${minutes}`;

                // 2. Atualiza os campos normais do formulário (exceto questions)
                this.researchForm.patchValue({
                    title: research.title,
                    courseId: research.course.id,
                    deadlineDate: deadline,
                    deadlineTime: formattedTime,
                });

                // 3. Preenche o FormArray com os grupos de perguntas
                research.questions.forEach((q) => {
                    this.questionsFormArray.push(
                        this.fb.group({
                            text: [q.text, Validators.required],
                            answerType: [q.answerType, Validators.required],
                        })
                    );
                });

                if (this.formAction === 'view') {
                    this.researchForm.disable(); // Desabilita o formulário para modo visualização
                    this.questionsFormArray.controls.forEach(group => group.disable()); // Desabilita as questões para modo visualização
                }
            },
            error: (err) => {
                console.error(`Erro ao carregar a pesquisa:`, err);

                let errorMessage = this.applicationUtils.getMessageError(err);
                this.messageService.showError(`Erro ao carregar a pesquisa: ` + errorMessage || '');
            }
        });
    }

    get questionsFormArray(): FormArray {
        return this.researchForm.get('questions') as FormArray;
    }


    onSubmit(): void {
        if (this.researchForm.invalid) {
            this.researchForm.markAllAsTouched();
            return;
        }

        const deadline = this.getCombinedDeadline();

        const research: Research = {
            ...this.researchForm.value,
            deadline,
            questions: this.questionsFormArray.value,
            id: Number(this.route.snapshot.paramMap.get('id'))
        };

        const observable = this.formAction === 'create'
            ? this.researchService.createResearch(research)
            : this.researchService.updateResearch(research);

        observable.subscribe({
            next: (response) => {
                this.messageService.showSuccess(response.message);
                this.router.navigate(['/pesquisas'], {
                    queryParams: { autoSearch: true }
                });
            },
            error: (err) => {
                console.error(`Erro ao ${this.applicationUtils.getActionMessageByFormActionInFemale(this.formAction, false)} pesquisa:`, err);

                let errorMessage = this.applicationUtils.getMessageError(err);
                this.messageService.showError(errorMessage);
            }
        });
    }

    getCombinedDeadline() {
        const deadlineDate = this.researchForm.value.deadlineDate;
        const deadlineTime = this.researchForm.value.deadlineTime;
        const [hours, minutes] = deadlineTime.split(':').map(Number);
        const combinedDeadline = new Date(deadlineDate);
        combinedDeadline.setHours(hours, minutes);

        return combinedDeadline.toISOString()
    }

    clear() {
        this.researchForm.reset();
    }

    loadCourses(): void {
        this.courseService.getAll().subscribe({
            next: (data) => {
                this.courses = data;
            },
            error: (err) => {
                console.error('Erro ao carregar disciplinas:', err);

                let errorMessage = this.applicationUtils.getMessageError(err);
                this.messageService.showError(`Erro ao carregar disciplinas: ` + errorMessage || '');
            }
        });
    }
}
