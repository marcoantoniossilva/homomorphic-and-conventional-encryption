import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';
  private tokenKey = 'authToken';
  private userKey = 'userData';

  private userSubject = new BehaviorSubject<any>(this.getUserData());

  constructor(private http: HttpClient) { }

  login(credentials: { username: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, {
      email: credentials.username,
      password: credentials.password
    }).pipe(
      tap(response => {
        if (response && response.auth && response.token) {
          localStorage.setItem(this.tokenKey, response.token);

          if (response.user) {
            localStorage.setItem(this.userKey, JSON.stringify(response.user));
            this.userSubject.next(response.user);
          }
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.userSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUserData(): any {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  get currentUser() {
    return this.userSubject.asObservable();
  }

  isAdmin(): boolean {
    const userData = this.getUserData();
    return userData && userData.role === 'ADMINISTRADOR';
  }

  isStudentUser(): boolean {
    const userData = this.getUserData();
    return userData && userData.role === 'ALUNO';
  }

  async validateToken(): Promise<boolean> {
    const token = this.getToken();

    if (!token) return false;

    try {
      await this.http.get(`${this.apiUrl}/validate-token`, {
        headers: { Authorization: `Bearer ${token}` }
      }).toPromise();
      return true;
    } catch (err) {
      this.logout();
      return false;
    }
  }

  getHeaderAuth(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}
