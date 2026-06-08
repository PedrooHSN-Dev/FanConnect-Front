import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './main-layout.html'
})
export class MainLayout implements OnInit {
  nomeUsuario: string = '';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>('http://localhost:8080/api/usuarios/me').subscribe({
      next: (res) => {
        this.nomeUsuario = res.nome;
        localStorage.setItem('nomeUsuario', res.nome);
      },
      error: () => {
        this.nomeUsuario = localStorage.getItem('nomeUsuario') || 'Usuário';
      }
    });
  }

  gerarAvatar(nomeCompleto: string): string {
    if (!nomeCompleto) return 'https://ui-avatars.com/api/?name=U&background=2861d6&color=fff';
    const partes = nomeCompleto.trim().split(' ');
    let iniciais = partes[0][0];
    if (partes.length >= 2) iniciais += partes[1][0];
    return `https://ui-avatars.com/api/?name=${iniciais}&background=2861d6&color=fff`;
  }

  sair() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}