// Angular Core
import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

// Application Services
import { MessageService } from '../../services/message.service';
import { UserService } from '../../services/user.service';

// Application Utilities
import { ApplicationUtils } from '../../utils/application-utils';


@Component({
    selector: 'user-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule
    ],
    templateUrl: './user-form.component.html',
    styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
    formType: 'administrador' | 'professor' | 'aluno' = 'aluno';
    userTypeMessage: string = 'Aluno(s)';
    userTypePath: string = 'alunos';

    formAction: 'create' | 'update' | 'view' = 'create';
    userForm!: FormGroup;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private userService: UserService,
        private messageService: MessageService,
        private applicationUtils: ApplicationUtils
    ) { }

    ngOnInit(): void {
        this.formType = this.route.snapshot.data['formType'] || 'aluno';
        this.userTypeMessage = this.userService.getUsersTypeForMessage(this.formType);
        this.userTypePath = this.userService.getUserTypeForPath(this.formType);

        this.formAction = this.route.snapshot.data['formAction'] || 'create';

        this.userForm = this.fb.group(
            {
                name: ['', [Validators.required, Validators.minLength(3)]],
                email: ['', [Validators.required, Validators.email]],
                password: [
                    '',
                    this.formAction === 'create' ? [Validators.required, Validators.minLength(6)] : []
                ],
                confirmPassword: [
                    '',
                    this.formAction === 'create' ? [Validators.required] : []
                ],
                ...(this.formType === 'professor' && {
                    teacherRegistrationNumber: ['', Validators.required]
                })
            },
            { validators: this.passwordsMatchValidator.bind(this) }
        );


        if (this.formAction === 'view' || this.formAction === 'update') {
            const id = this.route.snapshot.paramMap.get('id');
            if (id) {
                this.loadUserById(Number(id));
            }
        }

        if (this.formAction === 'view') {
            this.userForm.disable(); // Desabilita o formulário para modo visualização
        }
    }

    goBack() {
        this.location.back();
    }

    onSubmit(): void {
        if (this.userForm.invalid) {
            this.userForm.markAllAsTouched();
            return;
        }

        let user = this.userForm.value;
        user.id = this.route.snapshot.paramMap.get('id');

        if (this.formAction === 'update' && !user.password) {
            delete user.password;
            delete user.confirmPassword;
        }

        user.role = this.formType.toUpperCase();

        const observable = this.formAction === 'create'
            ? this.userService.createUser(user)
            : this.userService.updateUser(user);

        observable.subscribe({
            next: () => {
                this.messageService.showSuccess(`${this.applicationUtils.toTitleCase(this.formType)} ${this.applicationUtils.getActionMessageByFormActionInMale(this.formAction,true)} com sucesso!`);
                this.router.navigate([`/${this.userTypePath}`], {
                    queryParams: { autoSearch: true }
                });
            },
            error: (err) => {
                console.error(`Erro ao ${this.applicationUtils.getActionMessageByFormActionInMale(this.formAction, false)} ${this.formType}:`, err);

                let errorMessage = this.applicationUtils.getMessageError(err);
                this.messageService.showError(`Erro ao ${this.applicationUtils.getActionMessageByFormActionInMale(this.formAction, false)} ${this.formType}: ` + errorMessage || '');
            }
        });
    }

    clear() {
        this.userForm.reset();
    }

    // Validação personalizada para conferir se as senhas coincidem
    passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
        const password = group.get('password')?.value;
        const confirmPassword = group.get('confirmPassword')?.value;

        // Se ambos os campos estiverem vazios no modo update, tudo bem
        if (this.formAction === 'update' && !password && !confirmPassword) {
            return null;
        }

        // Se for create ou se pelo menos um campo estiver preenchido, validamos
        if (password !== confirmPassword) {
            group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
            return { passwordMismatch: true };
        }

        group.get('confirmPassword')?.setErrors(null);
        return null;
    }


    loadUserById(id: number): void {
        this.userService.getUserById(id).subscribe({
            next: (user) => {
                this.userForm.patchValue(user);
            },
            error: (err) => {
                console.error(`Erro ao carregar o ${this.formType}:`, err);

                let errorMessage = this.applicationUtils.getMessageError(err);
                this.messageService.showError(`Erro ao carregar o ${this.formType}: ` + errorMessage || '');
            }
        });
    }

    get name() { return this.userForm.get('name'); }
    get email() { return this.userForm.get('email'); }
    get password() { return this.userForm.get('password'); }
    get confirmPassword() {
        return this.userForm.get('confirmPassword');
    }


}