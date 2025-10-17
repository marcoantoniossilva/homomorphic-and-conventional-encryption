// Angular Core
import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';

// Angular CDK
import { SelectionModel } from '@angular/cdk/collections';

// Application Services
import { CourseService } from '../../services/course.service';
import { MessageService } from '../../services/message.service';
import { UserService } from '../../services/user.service';

// Application Models
import { Course, CourseFilter } from '../../models/course.model';
import { User } from '../../models/user.model';

// Application Utilities
import { ApplicationUtils } from '../../utils/application-utils';


@Component({
    selector: 'course-list',
    templateUrl: './course-list.component.html',
    styleUrls: ['./course-list.component.css'],
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
        MatCheckboxModule,
        MatSelectModule,
        MatIconModule,
        NgFor
    ]
})
export class CourseListComponent implements OnInit {
    displayedColumns: string[] = ['select', 'name', 'teacher', 'createdAt', 'updatedAt'];
    selection = new SelectionModel<Course>(true);
    dataSource = new MatTableDataSource<Course>();
    selectedCourse: Course | null = null;
    searched = false;
    teachers: User[] = [];

    filters: CourseFilter = {
        name: '',
        email: '',
        teacherId: undefined
    };

    constructor(
        private router: Router, 
        private location: Location, 
        private courseService: CourseService,
        private messageService: MessageService,
        private userService: UserService, 
        private route: ActivatedRoute,
        private applicationUtils: ApplicationUtils
    ) { }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            if (params['autoSearch']) {
                this.search();
            }
        });

        this.selection.clear();
        this.loadTeachers();
    }

    search(): void {
        this.searched = true;

        this.courseService.getByFilter({
            name: this.filters.name?.toLowerCase(),
            email: this.filters.email?.toLowerCase(),
            teacherId: this.filters.teacherId
        }).subscribe(courses => {
            this.dataSource.data = courses;
        });
    }

    clear() {
        this.filters.name = '';
        this.filters.email = '';
        this.filters.teacherId = undefined;
        this.searched = false;
    }

    goBack() {
        this.location.back();
    }

    toggleRow(row: Course) {
        this.selection.toggle(row);
        if (this.isOneSelected()) {
            this.selectedCourse = this.selection.selected[0];
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
        this.router.navigate([`/disciplinas/novo`])
    }

    viewCourse(course: Course): void {
        this.router.navigate([`/disciplinas`, course.id]);
    }

    editCourse(course: Course): void {
        this.router.navigate([`disciplinas/editar`, course.id]);
    }

    deleteCourse(): void {

        const courses = this.selection.selected;

        const confirmed = confirm(`Tem certeza que deseja excluir a(s) disciplina(s) selecionada(s)?`);
        if (!confirmed) return;

        let allSuccess = true;

        for (const course of courses) {
            this.courseService.deleteCourse(course.id).subscribe({
                error: (err) => {
                    allSuccess = false;

                    console.error(`Erro ao excluir a disciplina:`, err);

                    let errorMessage = this.applicationUtils.getMessageError(err);
                    this.messageService.showError(`Erro ao excluir a disciplina: ` + errorMessage || '');
                }
            });
        }

        if (allSuccess) {
            this.messageService.showSuccess(`Disciplina(s) excluída(s) com sucesso!`);
            this.selection.clear();
            this.dataSource.data = [];
            this.search();
        }

    }


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

