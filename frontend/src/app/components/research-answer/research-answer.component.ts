// Angular Core
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';

// Application Services
import { AnswerService } from '../../services/answer.service';
import { MessageService } from '../../services/message.service';
import { ResearchService } from '../../services/research.service';

// Application Models
import { Answer } from '../../models/answer.model';
import { Research } from '../../models/research.model';

// Application Utilities
import { ApplicationUtils } from '../../utils/application-utils';

@Component({
    selector: 'app-research-answer',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatRadioModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule
    ],
    templateUrl: './research-answer.component.html',
    styleUrls: ['./research-answer.component.css'],
})
export class ResearchAnswerComponent implements OnInit {
    research!: Research;
    answerForm!: FormGroup;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        private researchService: ResearchService,
        private answerService: AnswerService,
        private messageService: MessageService,
        private applicationUtils: ApplicationUtils
    ) { }

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        this.answerForm = this.fb.group({
            answers: this.fb.array([])
        });
        this.loadResearch(id);
    }

    loadResearch(id: number): void {
        this.researchService.getById(id).subscribe({
            next: (research) => {
                this.research = research;

                // Cria o formulário de respostas
                this.answerForm = this.fb.group({
                    answers: this.fb.array(
                        this.research.questions.map((q) =>
                            this.fb.group({
                                questionId: [q.id],
                                value: [null, Validators.required],
                            })
                        )
                    ),
                });
            },
            error: (err) => {
                console.error('Erro ao carregar pesquisa', err);

                let errorMessage = this.applicationUtils.getMessageError(err);
                this.messageService.showError(`Erro ao carregar a pesquisa: ` + errorMessage || '');
            },
        });
    }

    get answers(): FormArray {
        return this.answerForm.get('answers') as FormArray;
    }

    async onSubmit(): Promise<void> {
        if (this.answerForm.invalid) return;

        const payload: Answer = {
            researchId: this.research.id,
            answers: this.answerForm.value.answers,
        };

        for (const ans of payload.answers) {
            ans.value = ans.value.toString();
        }

        this.answerService.submitAnswers(payload).subscribe({
            next: () => {
                this.messageService.showSuccess('Respostas enviadas com sucesso!');
                this.router.navigate(['/pesquisas']);
            },
            error: (err) => {
                console.error(`Erro ao enviar as respostas:`, err);

                let errorMessage = this.applicationUtils.getMessageError(err);
                this.messageService.showError(`Erro ao enviar as respostas: ` + errorMessage || '');
            },
        });
    }

    get answersFormArray(): FormArray {
        return this.answerForm.get('answers') as FormArray;
    }

    clearAnswers(): void {
        this.answersFormArray.controls.forEach(control => {
            control.get('value')?.setValue(null);
        });
    }

    goBack(): void {
        this.router.navigate(['/pesquisas']);
    }
}
