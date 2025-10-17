import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { UserFilter } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'http://localhost:3000/users';

    constructor(private http: HttpClient, private authService: AuthService) { }

    getUserById(id: number): Observable<User> {
        const headers = this.authService.getHeaderAuth();
        return this.http.get<User>(`${this.apiUrl}/${id}`, { headers });
    }

    getUsersByFilter(filter: UserFilter): Observable<User[]> {
        const headers = this.authService.getHeaderAuth();
        return this.http.post<User[]>(`${this.apiUrl}/findByFilter`, filter, { headers });
    }

    createUser(user: User): Observable<User> {
        const headers = this.authService.getHeaderAuth();
        return this.http.post<User>(`${this.apiUrl}/create`, user, { headers });
    }

    updateUser(user: User): Observable<User> {
        const headers = this.authService.getHeaderAuth();
        return this.http.put<User>(`${this.apiUrl}/${user.id}`, user, { headers });
    }

    deleteUser(id: number) {
        const headers = this.authService.getHeaderAuth();
        return this.http.delete(`${this.apiUrl}/${id}`, { headers });
    }

    getUserTypeForPath(userType: string): string {
        if (userType === 'aluno') {
            return 'alunos';
        } else if (userType === 'professor') {
            return 'professores';
        } else {
            return 'administradores';
        }
    }

    getUsersTypeForMessage(userType: string): string {
        if (userType === 'aluno') {
            return 'Aluno(s)';
        } else if (userType === 'professor') {
            return 'Professor(es)';
        } else {
            return 'Administrador(es)';
        }
    }
}