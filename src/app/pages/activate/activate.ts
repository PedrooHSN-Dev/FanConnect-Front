import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-activate',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './activate.html',
  styleUrls: ['./activate.scss']
})
export class Activate {
  codigo = '';
  mensagemErro = '';

  constructor(private authService: Auth, private router: Router) {}

  confirmarAtivacao() {
    this.mensagemErro = '';

    if (!this.codigo || this.codigo.length !== 6) {
      this.mensagemErro = 'Por favor, digite o código completo de 6 dígitos.';
      return;
    }

    this.authService.activate({ codigo: this.codigo }).subscribe({
      next: (res) => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.mensagemErro = 'Código de ativação inválido ou expirado.';
      }
    });
  }

  irParaLogin() {
    this.router.navigate(['/login']);
  }
}