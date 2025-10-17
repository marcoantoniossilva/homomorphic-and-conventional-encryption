// Angular Core
import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';

// Angular CDK
import { SelectionModel } from '@angular/cdk/collections';

// Application Services
import { MessageService } from '../../services/message.service';
import { UserService } from '../../services/user.service';

// Application Models
import { User, UserFilter } from '../../models/user.model';

// Application Utilities
import { ApplicationUtils } from '../../utils/application-utils';


@Component({
    selector: 'users-list',
    templateUrl: './users-list.component.html',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatTableModule,
        MatMenuModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatCheckboxModule
    ]
})
export class UsersListComponent implements OnInit {
    userType: 'administrador' | 'professor' | 'aluno' = 'aluno';
    userTypeMessage: string = 'Aluno(s)';
    userTypePath: string = 'alunos';

    displayedColumns: string[] = [];
    selection = new SelectionModel<User>(true);
    dataSource = new MatTableDataSource<User>();
    selectedUser: User | null = null;
    searched = false;

    filters: UserFilter = {
        name: '',
        email: '',
        teacherRegistrationNumber: '',
        role: this.userType.toUpperCase()
    };

    constructor(
        private router: Router, 
        private location: Location, 
        private userService: UserService,
        private messageService: MessageService, 
        private route: ActivatedRoute,
        private applicationUtils: ApplicationUtils
    ) { }

    ngOnInit(): void {
        this.userType = this.route.snapshot.data['userType'] || 'aluno';
        this.userTypeMessage = this.userService.getUsersTypeForMessage(this.userType);
        this.userTypePath = this.userService.getUserTypeForPath(this.userType);

        this.displayedColumns = ['select', 'name', 'email', 'createdAt', 'updatedAt'];

        if (this.userType === 'professor') {
            this.displayedColumns.splice(3, 0, 'teacherRegistrationNumber');
        }

        this.selection.clear();

        this.route.queryParams.subscribe(params => {
            if (params['autoSearch']) {
                this.search();
            }
        });
    }

    search(): void {
        this.searched = true;

        this.userService.getUsersByFilter({
            name: this.filters.name?.toLowerCase(),
            email: this.filters.email?.toLowerCase(),
            role: this.userType.toUpperCase(),
            teacherRegistrationNumber: this.filters.teacherRegistrationNumber?.toLowerCase()
        }).subscribe(users => {
            this.dataSource.data = users;
        });
    }

    clear() {
        this.filters.name = '';
        this.filters.email = '';
        this.filters.teacherRegistrationNumber = '';
        this.searched = false;
    }

    goBack() {
        this.location.back();
    }

    toggleRow(row: User) {
        this.selection.toggle(row);
        if (this.isOneSelected()) {
            this.selectedUser = this.selection.selected[0];
        }
    }

    toggleAllRows(event: any) {
        if (event.checked) {
            this.dataSource.data.forEach(row => this.selection.select(row));
        } else {
            this.selection.clear();
        }
    }

    hasData(): boolean {
        return this.dataSource.data.length > 0;
    }

    isAllSelected() {
        const numRows = this.dataSource.data.length;
        const numSelected = this.selection.selected.length;
        return numRows > 0 && numSelected === numRows;
    }

    isAnySelected() {
        return this.selection.selected.length > 0;
    }

    isOneSelected() {
        return this.selection.selected.length === 1;
    }

    navigateToCreate(): void {
        this.router.navigate([`/${this.userTypePath}/novo`])
    }

    viewUser(user: User): void {
        this.router.navigate([`/${this.userTypePath}`, user.id]);
    }

    editUser(user: User): void {
        this.router.navigate([`${this.userTypePath}/editar`, user.id]);
    }

    deleteUser(): void {

        const users = this.selection.selected;

        const confirmed = confirm(`Tem certeza que deseja excluir o(s) ${this.userTypeMessage.toLocaleLowerCase()} selecionado(s)?`);
        if (!confirmed) return;

        let allSuccess = true;

        for (const user of users) {
            this.userService.deleteUser(user.id).subscribe({
                error: (err) => {
                    allSuccess = false;

                    console.error(`Erro ao excluir o ${this.userType}:`, err);

                    let errorMessage = this.applicationUtils.getMessageError(err);
                    this.messageService.showError(`Erro ao excluir ${this.userType}: ` + errorMessage || '');
                }
            });
        }

        if (allSuccess) {
            this.messageService.showSuccess(`${this.userTypeMessage} excluído(s) com sucesso!`);
            this.selection.clear();
            this.dataSource.data = [];
            this.search();
        }

    }

}

