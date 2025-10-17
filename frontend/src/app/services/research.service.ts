import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Research, ResearchFilter } from '../models/research.model';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class ResearchService {
    private apiUrl = 'http://localhost:3000/research';

    constructor(private http: HttpClient, private authService: AuthService) { }

    getById(id: number): Observable<Research> {
        const headers = this.authService.getHeaderAuth();
        return this.http.get<Research>(`${this.apiUrl}/${id}`, { headers });
    }

    getByFilter(filter: ResearchFilter): Observable<Research[]> {
        const headers = this.authService.getHeaderAuth();
        return this.http.post<Research[]>(`${this.apiUrl}/findByFilter`, filter, { headers });
    }

    getResearchResults(id: number): Observable<Research> {
        const headers = this.authService.getHeaderAuth();
        return this.http.get<Research>(`${this.apiUrl}/results/${id}`, { headers });
    }

    createResearch(research: Research): Observable<Research> {
        const headers = this.authService.getHeaderAuth();
        return this.http.post<Research>(`${this.apiUrl}/create`, research, { headers });
    }

    updateResearch(research: Research): Observable<any> {
        const headers = this.authService.getHeaderAuth();
        return this.http.put<Research>(`${this.apiUrl}/${research.id}`, research, { headers });
    }

    updateStatus(id: number, status: string): Observable<Research> {
        const headers = this.authService.getHeaderAuth();
        return this.http.patch<Research>(`${this.apiUrl}/updateStatus/${id}`, { status }, { headers });
    }

    deleteResearch(id: number) {
        const headers = this.authService.getHeaderAuth();
        return this.http.delete(`${this.apiUrl}/${id}`, { headers });
    }

}