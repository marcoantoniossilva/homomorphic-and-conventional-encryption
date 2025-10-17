import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessageService {
    private messageSubject = new Subject<{ type: 'success' | 'error' | 'info' | 'warning'; text: string }>();
    message$ = this.messageSubject.asObservable();

    showSuccess(text: string) {
        this.messageSubject.next({ type: 'success', text });
    }

    showError(text: string) {
        this.messageSubject.next({ type: 'error', text });
    }

    showInfo(text: string) {
        this.messageSubject.next({ type: 'info', text });
    }

    showWarning(text: string) {
        this.messageSubject.next({ type: 'warning', text });
    }
}
