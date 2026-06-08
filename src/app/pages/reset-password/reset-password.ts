import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './reset-password.html'
})
export class ResetPassword {
  codigo = '';
  novaSenha = '';
  confirmarSenha = '';
  mostrarSenha = false;
  mostrarConfirmarSenha = false;
  mensagemErro = '';

  constructor(private authService: Auth, private router: Router) {}

  redefinir() {
    this.mensagemErro = '';

    if (!this.codigo || this.codigo.length !== 6) {
      this.mensagemErro = 'Código inválido.';
      return;
    }

    if (this.novaSenha !== this.confirmarSenha) {
      this.mensagemErro = 'As senhas não coincidem!';
      return;
    }

    const dados = { codigo: this.codigo, novaSenha: this.novaSenha };

    this.authService.redefinirSenha(dados).subscribe({
      next: (res) => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.mensagemErro = 'Código inválido ou expirado.';
      }
    });
  }
}