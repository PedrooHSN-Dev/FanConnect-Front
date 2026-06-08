import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feed.html'
})
export class Feed implements OnInit {
  private apiUrl = 'http://localhost:8080/api';
  
  postagens: any[] = [];
  lembretes: any[] = [];
  novoConteudo = '';
  nomeUsuarioLogado: string = 'Carregando...';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.carregarNomeUsuario();
    this.carregarFeed();
    this.carregarLembretes();
  }

  carregarNomeUsuario() {
    this.http.get<any>('http://localhost:8080/api/usuarios/me').subscribe({
      next: (res) => {
        this.nomeUsuarioLogado = res.nome;
        localStorage.setItem('nomeUsuario', res.nome);
        this.cdr.detectChanges();
      },
      error: () => {
        const nomeSalvo = localStorage.getItem('nomeUsuario');
        this.nomeUsuarioLogado = nomeSalvo || 'Usuário';
      }
    });
  }

  carregarFeed() {
    this.http.get<any>(`${this.apiUrl}/feed?page=0&size=20`).subscribe({
      next: (res) => {
        this.postagens = res.content;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao buscar o feed', err)
    });
  }

  carregarLembretes() {
    this.http.get<any[]>(`${this.apiUrl}/agenda/global`).subscribe({
      next: (res) => {
        this.lembretes = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao buscar lembretes', err)
    });
  }

  publicarPost() {
    if (!this.novoConteudo.trim()) return;

    const novaPostagem = {
      conteudo: this.novoConteudo,
      oficial: false
    };

    this.http.post(`${this.apiUrl}/feed`, novaPostagem).subscribe({
      next: (res) => {
        this.novoConteudo = '';
        this.carregarFeed();
      },
      error: (err) => alert('Erro ao publicar postagem.')
    });
  }

  curtir(id: number) {
    this.http.post(`${this.apiUrl}/feed/${id}/curtir`, {}).subscribe({
      next: (res) => {
        this.carregarFeed();
      },
      error: (err) => console.error('Erro ao curtir', err)
    });
  }

  formatarNome(nomeCompleto: string): string {
    if (!nomeCompleto) return 'Meu Usuário';
    const partes = nomeCompleto.trim().split(' ');
    if (partes.length >= 2) {
      return `${partes[0]} ${partes[1]}`;
    }
    return partes[0];
  }

  gerarAvatar(nomeCompleto: string): string {
    if (!nomeCompleto) return 'https://ui-avatars.com/api/?name=MU&background=2861d6&color=fff';
    
    const partes = nomeCompleto.trim().split(' ');
    let iniciais = partes[0][0];
    if (partes.length >= 2) {
      iniciais += partes[1][0];
    }
    
    return `https://ui-avatars.com/api/?name=${iniciais}&background=2861d6&color=fff`;
  }

  formatarData(dataString: string): string {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}