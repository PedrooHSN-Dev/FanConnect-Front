import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Component({
  selector: 'app-conversas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './conversas.html'
})
export class Conversas implements OnInit, OnDestroy {
  private apiUrl = 'http://localhost:8080/api';

  usuarioLogadoId: number | null = null;

  minhasConversas: any[] = [];
  conversaAtiva: any = null;
  mensagens: any[] = [];

  mostrarModalBusca = false;
  mostrarModalGrupo = false;

  termoBusca = '';
  usuariosEncontrados: any[] = [];
  
  novoGrupoNome = '';
  usuariosSelecionadosParaGrupo: any[] = [];

  nomeUsuarioLogado = '';

  novaMensagemTexto = '';
  stompClient: Client | null = null;
  inscricaoAtual: any = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.nomeUsuarioLogado = localStorage.getItem('nomeUsuario') || '';
    
    this.http.get<any>(`${this.apiUrl}/usuarios/me`).subscribe(res => {
      this.usuarioLogadoId = res.id;
    });

    this.carregarMinhasConversas();
    this.conectarWebSocket();
  }

  ngOnDestroy() {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
  }

  carregarMinhasConversas() {
    this.http.get<any[]>(`${this.apiUrl}/chat/minhas-conversas`).subscribe({
      next: (res) => {
        this.minhasConversas = res;
        this.cdr.detectChanges();
      },
      error: () => console.error('Erro ao carregar conversas')
    });
  }

  getNomeConversa(conversa: any): string {
    if (!conversa) return 'Conversa';
    
    if (conversa.tipo === 'GRUPO') return conversa.nome;

    const outroParticipante = conversa.participantes?.find((p: any) => p.nome !== this.nomeUsuarioLogado);
    return outroParticipante ? outroParticipante.nome : 'Usuário Desconhecido';
  }

  buscarUsuarios() {
    if (this.termoBusca.length < 2) {
      this.usuariosEncontrados = [];
      return;
    }

    this.http.get<any[]>(`${this.apiUrl}/chat/usuarios/buscar?termo=${this.termoBusca}`).subscribe({
      next: (res) => {
        this.usuariosEncontrados = res;
        this.cdr.detectChanges();
      },
      error: () => console.error('Erro ao buscar usuários')
    });
  }

  iniciarConversaIndividual(usuarioDestino: any) {
    const payload = { usuarioIdDestino: usuarioDestino.id };
    
    this.http.post<any>(`${this.apiUrl}/chat/individual`, payload).subscribe({
      next: (conversa) => {
        this.mostrarModalBusca = false;
        this.termoBusca = '';
        this.carregarMinhasConversas();
        this.abrirConversa(conversa);
      },
      error: () => alert('Erro ao iniciar conversa.')
    });
  }

  criarGrupo() {
    if (!this.novoGrupoNome || this.usuariosSelecionadosParaGrupo.length === 0) return;

    const payload = {
      nome: this.novoGrupoNome,
      participantesIds: this.usuariosSelecionadosParaGrupo.map(u => u.id)
    };

    this.http.post<any>(`${this.apiUrl}/chat/grupo`, payload).subscribe({
      next: (grupo) => {
        this.mostrarModalGrupo = false;
        this.novoGrupoNome = '';
        this.usuariosSelecionadosParaGrupo = [];
        this.carregarMinhasConversas();
        this.abrirConversa(grupo);
      },
      error: () => alert('Erro ao criar grupo.')
    });
  }

  abrirConversa(conversa: any) {
    this.conversaAtiva = conversa;
    this.mensagens = [];
    
    this.http.get<any[]>(`${this.apiUrl}/chat/${conversa.id}/mensagens`).subscribe({
      next: (historico) => {
        this.mensagens = historico;
        this.cdr.detectChanges();
        this.rolarParaFim();
      }
    });

    this.inscreverNaConversa(conversa.id);
  }

  toggleSelecaoGrupo(usuario: any) {
    const index = this.usuariosSelecionadosParaGrupo.findIndex(u => u.id === usuario.id);
    if (index > -1) {
      this.usuariosSelecionadosParaGrupo.splice(index, 1);
    } else {
      this.usuariosSelecionadosParaGrupo.push(usuario);
    }
  }

  isSelecionadoParaGrupo(usuario: any): boolean {
    return this.usuariosSelecionadosParaGrupo.some(u => u.id === usuario.id);
  }

  gerarAvatar(nome: string): string {
    if (!nome) return 'https://ui-avatars.com/api/?name=U&background=2861d6&color=fff';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=2861d6&color=fff`;
  }

  conectarWebSocket() {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
    });

    this.stompClient.onConnect = () => {
      console.log('Conectado ao WebSocket!');
      if (this.conversaAtiva) this.inscreverNaConversa(this.conversaAtiva.id);
    };

    this.stompClient.activate();
  }

  inscreverNaConversa(conversaId: number) {
    if (!this.stompClient || !this.stompClient.connected) return;

    if (this.inscricaoAtual) {
      this.inscricaoAtual.unsubscribe();
    }

    this.inscricaoAtual = this.stompClient.subscribe(`/topic/conversas/${conversaId}`, (mensagem) => {
      const novaMensagem = JSON.parse(mensagem.body);
      this.mensagens.push(novaMensagem);
      this.cdr.detectChanges();
      this.rolarParaFim();
    });
  }

  enviarMensagem() {
    if (!this.novaMensagemTexto.trim() || !this.conversaAtiva || !this.usuarioLogadoId) return;

    const payload = {
      conversaId: this.conversaAtiva.id,
      remetenteId: this.usuarioLogadoId,
      conteudo: this.novaMensagemTexto
    };

    this.stompClient?.publish({
      destination: '/app/chat/enviar',
      body: JSON.stringify(payload)
    });

    this.novaMensagemTexto = '';
  }

  rolarParaFim() {
    setTimeout(() => {
      const chatContainer = document.getElementById('chat-container');
      if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 100);
  }
}