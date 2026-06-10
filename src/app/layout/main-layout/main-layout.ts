import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.html'
})
export class MainLayout implements OnInit {
  nomeUsuarioLogado: string = localStorage.getItem('nomeUsuario') || 'Carregando...';
  fotoPerfil: string | null = localStorage.getItem('fotoPerfil');
  
  temNotificacaoMensagem = false; 
  temNotificacaoCurtida = false;

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.carregarNomeUsuario();
  }

  carregarNomeUsuario() {
    this.http.get<any>('http://localhost:8080/api/usuarios/me').subscribe({
      next: (res) => {
        this.nomeUsuarioLogado = res.nome;
        this.fotoPerfil = res.fotoPerfil;
        
        localStorage.setItem('nomeUsuario', res.nome);
        if (res.fotoPerfil) {
          localStorage.setItem('fotoPerfil', res.fotoPerfil);
        } else {
          localStorage.removeItem('fotoPerfil');
        }
        
        this.cdr.detectChanges(); 
      },
      error: () => {
        this.cdr.detectChanges();
      }
    });
  }

  sair() {
    localStorage.removeItem('token');
    localStorage.removeItem('nomeUsuario');
    localStorage.removeItem('fotoPerfil');
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  formatarNome(nomeCompleto: string): string {
    if (!nomeCompleto || nomeCompleto === 'Carregando...') return '...';
    const partes = nomeCompleto.trim().split(' ');
    if (partes.length >= 2) {
      return `${partes[0]} ${partes[1]}`;
    }
    return partes[0];
  }

  gerarAvatar(nomeCompleto: string): string {
    if (!nomeCompleto || nomeCompleto === 'Carregando...') {
      return 'https://ui-avatars.com/api/?name=MU&background=2861d6&color=fff';
    }
    const partes = nomeCompleto.trim().split(' ');
    let iniciais = partes[0][0];
    if (partes.length >= 2) {
      iniciais += partes[1][0];
    }
    return `https://ui-avatars.com/api/?name=${iniciais}&background=2861d6&color=fff`;
  }
}