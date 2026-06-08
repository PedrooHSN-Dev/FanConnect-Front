import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  email = '';
  senha = '';
  mensagemErro = '';
  mostrarSenha = false;
  lembrarDispositivo = false;

  constructor(private authService: Auth, private router: Router) {}

entrar() {
    this.mensagemErro = '';
    const credenciais = { email: this.email, senha: this.senha };

    this.authService.login(credenciais).subscribe({
      next: (resposta) => {
        const tokenJWT = resposta.token;
        if (this.lembrarDispositivo) {
          localStorage.setItem('token', tokenJWT);
        } else {
          sessionStorage.setItem('token', tokenJWT);
        }
        
        this.router.navigate(['/feed']);
      },
      error: (erro) => {
        this.mensagemErro = 'E-mail ou senha inválidos!';
      }
    });
  }

  entrarComGoogle() {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  esqueciSenha() {
    this.router.navigate(['/forgot-password']);
  }

  irParaCadastro() {
    this.router.navigate(['/register']);
  }
  
}