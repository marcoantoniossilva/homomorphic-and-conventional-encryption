import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Answer } from '../models/answer.model';

@Injectable({
    providedIn: 'root'
})
export class AnswerService {
    private apiUrl = 'http://localhost:3000/answers';

    constructor(private http: HttpClient, private authService: AuthService) { }

    submitAnswers(answer: Answer): Observable<Answer> {
        const headers = this.authService.getHeaderAuth();
        return this.http.post<Answer>(`${this.apiUrl}`, answer, { headers });
    }
}