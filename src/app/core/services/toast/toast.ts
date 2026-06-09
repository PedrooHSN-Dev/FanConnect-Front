import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<ToastMessage | null>();
  
  public toast$: Observable<ToastMessage | null> = this.toastSubject.asObservable();

  show(message: string, type: ToastType = 'info') {
    console.log('1. SERVIÇO RECEBEU:', message);
    this.toastSubject.next({ message, type });
    setTimeout(() => this.clear(), 3000);
  }

  success(message: string) { this.show(message, 'success'); }
  error(message: string) { this.show(message, 'error'); }
  info(message: string) { this.show(message, 'info'); }
  
  clear() { this.toastSubject.next(null); }
}