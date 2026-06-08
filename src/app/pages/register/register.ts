import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class Register {
  nome = '';
  email = '';
  matricula = '';
  senha = '';
  confirmarSenha = '';

  mostrarSenha = false;
  mostrarConfirmarSenha = false;
  mensagemErro = '';

  constructor(private authService: Auth, private router: Router) {}

  cadastrar() {
    this.mensagemErro = '';

    if (this.senha !== this.confirmarSenha) {
      this.mensagemErro = 'As senhas não coincidem!';
      return;
    }

    const novoUsuario = { 
      nome: this.nome, 
      email: this.email, 
      matricula: this.matricula,
      senha: this.senha 
    };

    this.authService.register(novoUsuario).subscribe({
      next: (res) => {
        this.router.navigate(['/activate']);
      },
      error: (err) => {
        this.mensagemErro = 'Erro ao cadastrar. Verifique se os dados já existem.';
      }
    });
  }

  irParaLogin() {
    this.router.navigate(['/login']);
  }
}