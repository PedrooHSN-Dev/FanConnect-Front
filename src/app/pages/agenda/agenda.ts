import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agenda.html'
})
export class Agenda implements OnInit {
  apiUrl = 'http://localhost:8080/api/agenda';
  eventos: any[] = [];
  eventoSelecionado: any = null;
  
  dataReferencia = new Date();
  diasNoCalendario: any[] = [];
  meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  modoFormulario = false;

  novoEvento = {
    id: null,
    titulo: '',
    descricao: '',
    dataHora: '',
    localizacao: '',
    categoria: 'ACADEMICO',
    visibilidade: 'PRIVADO',
    lembreteAtivo: false,
    minutosAvisoLembrete: 30
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.carregarAgenda();
  }

  carregarAgenda() {
    this.http.get<any[]>(`${this.apiUrl}/meus-eventos`).subscribe({
      next: (res) => {
        this.eventos = res;
        this.gerarCalendario();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao buscar agenda:', err)
    });
  }

  gerarCalendario() {
    const ano = this.dataReferencia.getFullYear();
    const mes = this.dataReferencia.getMonth();
    
    const primeiroDiaMes = new Date(ano, mes, 1).getDay();
    const ultimoDiaMes = new Date(ano, mes + 1, 0).getDate();
    
    this.diasNoCalendario = [];

    for (let i = 0; i < primeiroDiaMes; i++) {
      this.diasNoCalendario.push({ dia: null });
    }

    for (let i = 1; i <= ultimoDiaMes; i++) {
      const dataDocDia = new Date(ano, mes, i).toISOString().split('T')[0];
      const temEvento = this.eventos.some(e => e.dataHora.startsWith(dataDocDia));
      
      this.diasNoCalendario.push({ 
        dia: i, 
        dataStr: dataDocDia,
        possuiEvento: temEvento 
      });
    }
  }

salvarEvento() {
    const request = this.novoEvento.id 
      ? this.http.put(`${this.apiUrl}/${this.novoEvento.id}`, this.novoEvento)
      : this.http.post(this.apiUrl, this.novoEvento);

    request.subscribe({
      next: () => {
        this.modoFormulario = false;
        this.resetForm();
        this.carregarAgenda();
      },
      error: (err) => {
        console.error('Erro ao salvar:', err);
        alert('Erro ao processar o evento. Verifique o console.');
      }
    });
  }

  resetForm() {
    this.novoEvento = {
      id: null,
      titulo: '', descricao: '', dataHora: '', localizacao: '',
      categoria: 'ACADEMICO', visibilidade: 'PRIVADO',
      lembreteAtivo: false, minutosAvisoLembrete: 30
    };
  }

  mudarMes(direcao: number) {
    this.dataReferencia.setMonth(this.dataReferencia.getMonth() + direcao);
    this.gerarCalendario();
  }

  selecionarEvento(evento: any) {
    this.eventoSelecionado = evento;
    this.modoFormulario = false;
  }

  getCorCategoria(cat: string) {
    return cat === 'FESTA' || cat === 'ESPORTES' ? 'bg-[#ff7315]' : 'bg-[#2861d6]';
  }

  formatarData(d: string) {
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  deletarEvento(id: number) {
    if (confirm('Tem certeza que deseja deletar este evento?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.eventoSelecionado = null;
          this.carregarAgenda();
        },
        error: (err) => alert('Erro ao deletar evento.')
      });
    }
  }

  prepararEdicao(evento: any) {
    this.novoEvento = { ...evento };
    this.modoFormulario = true;
  }
}