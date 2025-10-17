// Angular Core
import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';
import { MatNativeDateModule } from '@angular/material/core';

// Angular CDK
import { SelectionModel } from '@angular/cdk/collections';

// Application Services
import { AuthService } from '../../services/auth.service';
import { CourseService } from '../../services/course.service';
import { MessageService } from '../../services/message.service';
import { ResearchService } from '../../services/research.service';
import { UserService } from '../../services/user.service';

// Application Models
import { Course } from '../../models/course.model';
import { Research, ResearchFilter } from '../../models/research.model';
import { User } from '../../models/user.model';

// Application Utilities
import { ApplicationUtils } from '../../utils/application-utils';


@Component({
    selector: 'research-list',
    templateUrl: './research-list.component.html',
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
        MatDatepickerModule,
        MatNativeDateModule,
        NgFor
    ]
})
export class ResearchListComponent implements OnInit {
    displayedColumns: string[] = [];
    selection = new SelectionModel<Research>(true);
    dataSource = new MatTableDataSource<Research>();
    selectedResearch: Research | null = null;
    searched = false;
    courses: Course[] = [];
    teachers: User[] = [];
    isStudentUser = true;
    isAdminUser = false;

    filters: ResearchFilter = {
        title: '',
        courseId: undefined,
        teacherId: undefined,
        status: '',
        initialDeadline: undefined,
        finalDeadline: undefined
    };

    constructor(
        private router: Router, 
        private location: Location, 
        private researchService: ResearchService,
        private messageService: MessageService, 
        private userService: UserService, 
        private courseService: CourseService,
        private route: ActivatedRoute, 
        private authService: AuthService,
        private applicationUtils: ApplicationUtils
    ) { }

    ngOnInit(): void {
        this.displayedColumns = ['select', 'title', 'course', 'teacher', 'status', 'totalAnswers', 'deadline', 'createdAt', 'updatedAt'];

        this.route.queryParams.subscribe(params => {
            if (params['autoSearch']) {
                this.search();
            }
        });

        this.selection.clear();
        this.loadCourses();
        this.loadTeachers();

        this.isStudentUser = this.authService.isStudentUser();
        this.isAdminUser = this.authService.isAdmin();

        if (this.isStudentUser) {
            this.displayedColumns.splice(5, 0, 'hasResponded');
        }
    }

    search(): void {
        this.searched = true;

        this.researchService.getByFilter({
            title: this.filters.title?.toLowerCase(),
            courseId: this.filters.courseId,
            teacherId: this.filters.teacherId,
            status: this.filters.status,
            initialDeadline: this.filters.initialDeadline,
            finalDeadline: this.filters.finalDeadline
        }).subscribe(researchList => {
            researchList.forEach(research => {
                if (research.status === 'ABERTA' && new Date(research.deadline) < new Date()) {
                    research.status = 'ENCERRADA_PRAZO';
                }
            })

            this.dataSource.data = researchList;
        });
    }

    canAnswer(): boolean {
        return this.selectedResearch?.status === 'ABERTA' && this.isStudentUser && !this.selectedResearch.hasResponded;
    }

    answer(): void {
        this.router.navigate(['pesquisas/responder/' + this.selectedResearch?.id]);
    }

    clear() {
        this.filters.title = '';
        this.filters.courseId = undefined;
        this.filters.teacherId = undefined;
        this.filters.status = '';
        this.filters.initialDeadline = undefined;
        this.filters.finalDeadline = undefined;

        this.searched = false;
    }

    goBack() {
        this.location.back();
    }

    toggleRow(row: Research) {
        this.selection.toggle(row);
        if (this.isOneSelected()) {
            this.selectedResearch = this.selection.selected[0];
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
        this.router.navigate([`/pesquisas/novo`])
    }

    viewResearch(research: Research): void {
        this.router.navigate([`/pesquisas`, research.id]);
    }

    editResearch(research: Research): void {
        this.router.navigate([`pesquisas/editar`, research.id]);
    }

    viewResearchResults(research: Research): void {
        this.router.navigate([`pesquisas/resultados`, research.id]);
    }

    finishResearch(): void {
        const confirmed = confirm(`Tem certeza que deseja finalizar a(s) pesquisa(s) selecionada(s)?`);
        if (!confirmed) return;

        const researchList = this.selection.selected;
        let allSuccess = true;
        const status = 'FINALIZADA';

        for (const research of researchList) {
            this.researchService.updateStatus(research.id, status).subscribe({
                error: (err) => {
                    allSuccess = false;
                    console.error(`Erro ao finalizar a pesquisa:`, err);

                    let errorMessage = this.applicationUtils.getMessageError(err);
                    this.messageService.showError('Erro ao finalizar a pesquisa: ' + errorMessage || '');
                }
            })
        }

        if (allSuccess) {
            this.messageService.showSuccess(`Pesquisa(s) finalizada(s) com sucesso!`);
            this.selection.clear();
            this.dataSource.data = [];
            this.search();
        }
    }

    canFinish() {
        return this.selection.selected.length > 0 && this.selection.selected.every(research => research.status === 'ABERTA' || research.status === 'ENCERRADA_PRAZO');
    }

    isFinished(): boolean {
        return this.selection.selected.length === 1 && this.selection.selected[0].status === 'FINALIZADA';
    }

    deleteResearch(): void {

        const researchList = this.selection.selected;

        const confirmed = confirm(`Tem certeza que deseja excluir a(s) pesquisa(s) selecionada(s)?`);
        if (!confirmed) return;

        let allSuccess = true;

        for (const research of researchList) {
            this.researchService.deleteResearch(research.id).subscribe({
                error: (err) => {
                    allSuccess = false;

                    let errorMessage = this.applicationUtils.getMessageError(err);
                    this.messageService.showError(`Erro ao excluir a pesquisa: ` + errorMessage || '');
                }
            });
        }

        if (allSuccess) {
            this.messageService.showSuccess(`Pesquisa(s) excluída(s) com sucesso!`);
            this.selection.clear();
            this.dataSource.data = [];
            this.search();
        }

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

