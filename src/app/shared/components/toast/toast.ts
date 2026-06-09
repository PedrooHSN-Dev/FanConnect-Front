import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, ToastMessage } from '../../../core/services/toast/toast';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
})
export class Toast implements OnInit, OnDestroy {
  public toast: ToastMessage | null = null;
  private subscription: Subscription | null = null;

  constructor(private toastService: ToastService) {}

  public ngOnInit(): void {
    this.subscription = this.toastService.toast$.subscribe((toastMessage) => {
      console.log('2. COMPONENTE VISUAL OUVIU:', toastMessage);
      this.toast = toastMessage;
    });
  }

  public fechar(): void {
    this.toastService.clear();
  }

  public ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}