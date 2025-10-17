// Angular Core
import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// Angular Forms
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

// Application Services
import { CourseService } from '../../services/course.service';
import { MessageService } from '../../services/message.service';
import { UserService } from '../../services/user.service';

// Application Models
import { User } from '../../models/user.model';

// Application Utilities
import { ApplicationUtils } from '../../utils/application-utils';


@Component({
    selector: 'course-form',
    standalone: true,
    imports: [
        FormsModule,
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
        MatOptionModule,
        NgFor
    ],
    templateUrl: './course-form.component.html',
    styleUrls: ['./course-form.component.css']
})
export class CourseFormComponent implements OnInit {
    formAction: 'create' | 'update' | 'view' = 'create';
    courseForm!: FormGroup;
    teachers: User[] = [];

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private courseService: CourseService,
        private messageService: MessageService,
        private userService: UserService,
        private applicationUtils: ApplicationUtils
    ) { }

    ngOnInit(): void {
        this.formAction = this.route.snapshot.data['formAction'] || 'create';
        this.loadTeachers();

        this.courseForm = this.fb.group(
            {
                name: ['', [Validators.required, Validators.minLength(3)]],
                teacherId: [null, Validators.required]
            }
        );


        if (this.formAction === 'view' || this.formAction === 'update') {
            const id = this.route.snapshot.paramMap.get('id');
            if (id) {
                this.loadCourseById(Number(id));
            }
        }

        if (this.formAction === 'view') {
            this.courseForm.disable(); // Desabilita o formulário para modo visualização
        }
    }

    goBack() {
        this.location.back();
    }

    onSubmit(): void {
        if (this.courseForm.invalid) {
            this.courseForm.markAllAsTouched();
            return;
        }

        let course = this.courseForm.value;
        course.id = this.route.snapshot.paramMap.get('id');

        const observable = this.formAction === 'create'
            ? this.courseService.createCourse(course)
            : this.courseService.updateCourse(course);

        observable.subscribe({
            next: () => {
                this.messageService.showSuccess(`Disciplina ${this.applicationUtils.getActionMessageByFormActionInFemale(this.formAction, true)} com sucesso!`);
                this.router.navigate(['/disciplinas'], {
                    queryParams: { autoSearch: true }
                });
            },
            error: (err) => {
                console.error(`Erro ao ${this.applicationUtils.getActionMessageByFormActionInFemale(this.formAction, false)} disciplina:`, err);

                let errorMessage = this.applicationUtils.getMessageError(err);
                this.messageService.showError(`Erro ao ${this.applicationUtils.getActionMessageByFormActionInFemale(this.formAction, false)} disciplina: ` + errorMessage);
            }
        });
    }

    clear() {
        this.courseForm.reset();
    }

    loadCourseById(id: number): void {
        this.courseService.getById(id).subscribe({
            next: (course) => {
                this.courseForm.patchValue(course);
            },
            error: (err) => {
                console.error(`Erro ao carregar a disciplina:`, err);

                let errorMessage = this.applicationUtils.getMessageError(err);
                this.messageService.showError(`Erro ao carregar a disciplina: ` + errorMessage || '');
            }
        });
    }

    get name() { return this.courseForm.get('name'); }
    get teacher() { return this.courseForm.get('teacherId'); }

    loadTeachers(): void {
        this.userService.getUsersByFilter({ role: 'PROFESSOR' }).subscribe({
            next: (data) => {
                this.teachers = data;
            },
            error: (err) => {
                console.error('Erro ao carregar professores:', err);

                let errorMessage = this.applicationUtils.getMessageError(err);
                this.messageService.showError(`Erro ao carregar professores: ` + errorMessage || '');
            }
        });
    }

}