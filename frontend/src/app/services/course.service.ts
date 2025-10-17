import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course, CourseFilter } from '../models/course.model';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class CourseService {
    private apiUrl = 'http://localhost:3000/courses';

    constructor(private http: HttpClient, private authService: AuthService) { }

    getAll(): Observable<Course[]> {
        const headers = this.authService.getHeaderAuth();
        return this.http.get<Course[]>(`${this.apiUrl}/`, { headers });
    }

    getById(id: number): Observable<Course> {
        const headers = this.authService.getHeaderAuth();
        return this.http.get<Course>(`${this.apiUrl}/${id}`, { headers });
    }

    getByFilter(filter: CourseFilter): Observable<Course[]> {
        const headers = this.authService.getHeaderAuth();
        return this.http.post<Course[]>(`${this.apiUrl}/findByFilter`, filter, { headers });
    }

    createCourse(course: Course): Observable<Course> {
        const headers = this.authService.getHeaderAuth();
        return this.http.post<Course>(`${this.apiUrl}/create`, course, { headers });
    }

    updateCourse(course: Course): Observable<Course> {
        const headers = this.authService.getHeaderAuth();
        return this.http.put<Course>(`${this.apiUrl}/${course.id}`, course, { headers });
    }

    deleteCourse(id: number) {
        const headers = this.authService.getHeaderAuth();
        return this.http.delete(`${this.apiUrl}/${id}`, { headers });
    }

}