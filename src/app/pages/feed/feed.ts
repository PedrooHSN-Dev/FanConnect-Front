import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../core/services/toast/toast';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './feed.html'
})
export class Feed implements OnInit {
  private apiUrl = 'http://localhost:8080/api';
  
  postagens: any[] = [];
  lembretes: any[] = [];
  novoConteudo = '';
  nomeUsuarioLogado: string = localStorage.getItem('nomeUsuario') || 'Carregando...';
  novoComentario: { [key: number]: string } = {};
  novoAnexoUrl: string | null = null;
  mostrandoFormEvento: boolean = false;
  novoEvento: any = {
    titulo: '',
    descricao: 'Evento proposto pela comunidade.',
    dataHora: '',
    localizacao: '',
    categoria: 'ESTUDOS',
    visibilidade: 'PUBLICO'
  };
  toast: { mensagem: string, tipo: 'sucesso' | 'erro' | 'aviso' } | null = null;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService,
  ) {}

  acionarInputArquivo(fileInput: HTMLInputElement) {
    fileInput.click();
  }

  fazerUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('arquivo', file);

      this.http.post<any>(`${this.apiUrl}/upload`, formData).subscribe({
        next: (res) => {
          this.novoAnexoUrl = res.url;
          this.cdr.detectChanges();
        },
        error: (err) => this.toastService.error('Erro ao fazer upload da imagem.')
      });
    }
  }

  removerAnexo() {
    this.novoAnexoUrl = null;
  }

  toggleFormEvento() {
    this.mostrandoFormEvento = !this.mostrandoFormEvento;
    if (!this.mostrandoFormEvento) {
      this.novoEvento = { titulo: '', descricao: 'Evento proposto pela comunidade.', dataHora: '', localizacao: '', categoria: 'ESTUDOS', visibilidade: 'GLOBAL' };    }
  }

  ngOnInit() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      window.history.replaceState({}, '', '/feed');
    }
    
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
        this.cdr.detectChanges();
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
    this.http.get<any[]>(`${this.apiUrl}/agenda/meus-eventos`).subscribe({
      next: (res) => {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const eventosFuturos = res.filter(e => new Date(e.dataHora) >= hoje);
        
        const eventosUnicos = eventosFuturos.filter((evento, index, self) =>
          index === self.findIndex((t) => (
            t.titulo === evento.titulo && t.dataHora === evento.dataHora
          ))
        );

        this.lembretes = eventosUnicos
          .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())
          .slice(0, 5);
          
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao buscar lembretes', err)
    });
  }

  publicarPost() {
    if (!this.novoConteudo.trim() && !this.novoAnexoUrl) return;

    const novaPostagem: any = {
      conteudo: this.novoConteudo,
      oficial: false,
      anexoUrl: this.novoAnexoUrl
    };

    if (this.mostrandoFormEvento) {
      if (!this.novoEvento.titulo || !this.novoEvento.dataHora) {
        this.toastService.info('Por favor, preencha o Título e a Data/Hora do evento antes de publicar!');
        return;
      }
      novaPostagem.eventoProposto = this.novoEvento;
    }

    this.http.post(`${this.apiUrl}/feed`, novaPostagem).subscribe({
      next: (res) => {
        this.novoConteudo = '';
        this.novoAnexoUrl = null;
        this.mostrandoFormEvento = false;
        this.novoEvento = { titulo: '', descricao: 'Evento proposto pela comunidade.', dataHora: '', localizacao: '', categoria: 'ESTUDOS', visibilidade: 'GLOBAL' };
        
        this.carregarFeed();
      },
      error: (err) => this.toastService.error('Erro ao publicar postagem. Verifique se todos os campos estão corretos.')
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
    if (!nomeCompleto || nomeCompleto === 'Carregando...') return '...';
    return nomeCompleto.trim();
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

  toggleComentarios(post: any) {
    post.mostrarComentarios = !post.mostrarComentarios;
    
    if (post.mostrarComentarios && !post.comentariosCarregados) {
      this.carregarComentarios(post);
    }
  }

  carregarComentarios(post: any) {
    this.http.get<any[]>(`${this.apiUrl}/feed/${post.id}/comentarios`).subscribe({
      next: (res) => {
        post.comentarios = res;
        post.comentariosCarregados = true;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao buscar comentários', err)
    });
  }

  enviarComentario(post: any) {
    const conteudo = this.novoComentario[post.id];
    if (!conteudo || !conteudo.trim()) return;

    this.http.post(`${this.apiUrl}/feed/${post.id}/comentar`, { conteudo: conteudo }, { responseType: 'text' }).subscribe({
      next: () => {
        this.novoComentario[post.id] = '';
        post.quantidadeComentarios++;
        this.carregarComentarios(post);
      },
      error: (err) => this.toastService.error('Erro ao enviar o comentário.')
    });
  }

  salvarNaAgenda(post: any) {
    if (post.eventoSalvoPorMim) return;

    this.http.post(`${this.apiUrl}/feed/${post.id}/salvar-agenda`, {}).subscribe({
      next: () => {
        post.eventoSalvoPorMim = true;
        this.toastService.success('Evento salvo na sua agenda com sucesso!');
        this.carregarLembretes();
      },
      error: () => this.toastService.info('Este evento já está na sua agenda ou ocorreu um erro.')
    });
  }

  toggleMenu(post: any) {
    post.mostrarMenu = !post.mostrarMenu;
  }

  copiarLink(post: any) {
    const url = `${window.location.origin}/feed?post=${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
      this.toastService.success('Link copiado para a área de transferência!');
      post.mostrarMenu = false;
    }).catch(() => {
      this.toastService.error('Erro ao copiar o link.');
    });
  }

  excluirPost(post: any) {
    if (confirm('Tem certeza de que deseja excluir esta postagem? Essa ação não pode ser desfeita.')) {
      this.http.delete(`${this.apiUrl}/feed/${post.id}`).subscribe({
        next: () => {
          this.toastService.success('Postagem excluída com sucesso.');
          this.carregarFeed();
        },
        error: () => this.toastService.error('Erro ao excluir a postagem.')
      });
    }
  }
}