import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './forgot-password.html'
})
export class ForgotPassword {
  email = '';
  mensagemErro = '';
  mensagemSucesso = '';


  constructor(private authService: Auth, private router: Router) {}

  solicitar() {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    if (!this.email) {
      this.mensagemErro = 'Por favor, insira o seu e-mail.';
      return;
    }

    this.authService.esqueciSenha({ email: this.email }).subscribe({
      next: (res) => {
        this.router.navigate(['/reset-password']);
      },
      error: (err) => {
        this.mensagemErro = 'Ocorreu um erro ao processar o pedido.';
      }
    });
  }

  irParaLogin() {
    this.router.navigate(['/login']);
  }
}