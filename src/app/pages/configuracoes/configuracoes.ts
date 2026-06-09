import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracoes.html'
})
export class Configuracoes implements OnInit {
  private apiUrl = 'http://localhost:8080/api';
  
  senhas = { atual: '', nova: '', confirmacao: '' };
  
  possuiSenhaNoBanco: boolean = true; 
  matricula: string = '';
  possuiMatricula: boolean = true;
  
  toast: { mensagem: string, tipo: 'sucesso' | 'erro' | 'aviso' } | null = null;
  versaoApp = '1.0.0-beta';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit() {
    this.carregarStatusDoPerfil();
  }

  carregarStatusDoPerfil() {
    this.http.get<any>(`${this.apiUrl}/usuarios/meu-perfil`).subscribe({
      next: (dados) => {
        console.log("Resposta do Back-end:", dados);
        this.possuiSenhaNoBanco = dados.possuiSenha;
        this.matricula = dados.matricula || '';
        this.possuiMatricula = !!this.matricula;
        this.cdr.detectChanges();
      },
      error: () => console.error('Erro ao buscar status do perfil.')
    });
  }

  mostrarToast(mensagem: string, tipo: 'sucesso' | 'erro' | 'aviso' = 'sucesso') {
    this.toast = { mensagem, tipo };
    setTimeout(() => { this.toast = null; this.cdr.detectChanges(); }, 3500);
    this.cdr.detectChanges();
  }

  salvarMatricula() {
    if (!this.matricula.trim()) {
      this.mostrarToast('A matrícula não pode ficar vazia.', 'aviso');
      return;
    }
    this.http.put(`${this.apiUrl}/usuarios/matricula`, { matricula: this.matricula }).subscribe({
      next: () => {
        this.mostrarToast('Matrícula vinculada com sucesso!', 'sucesso');
        this.possuiMatricula = true;
        this.cdr.detectChanges();
      },
      error: (err) => this.mostrarToast(err.error || 'Erro ao vincular matrícula.', 'erro')
    });
  }

  alterarSenha() {
    if (this.possuiSenhaNoBanco && !this.senhas.atual) {
      this.mostrarToast('Digite a sua senha atual.', 'aviso');
      return;
    }

    if (!this.senhas.nova || !this.senhas.confirmacao) {
      this.mostrarToast('Preencha a nova senha e a confirmação.', 'aviso');
      return;
    }

    if (this.senhas.nova !== this.senhas.confirmacao) {
      this.mostrarToast('A nova senha e a confirmação não conferem.', 'aviso');
      return;
    }

    const payload = {
      senhaAtual: this.possuiSenhaNoBanco ? this.senhas.atual : null,
      senhaNova: this.senhas.nova
    };

    this.http.put(`${this.apiUrl}/usuarios/senha`, payload).subscribe({
      next: () => {
        const msg = this.possuiSenhaNoBanco ? 'Senha atualizada com sucesso.' : 'Senha definida com sucesso. Agora você pode usá-la no login!';
        this.mostrarToast(msg, 'sucesso');
        this.senhas = { atual: '', nova: '', confirmacao: '' };
        this.possuiSenhaNoBanco = true;
        this.cdr.detectChanges();
      },
      error: (err) => this.mostrarToast(err.error || 'Erro ao definir a senha.', 'erro')
    });
  }

  excluirConta() {
    const confirmacao1 = confirm('Atenção! Esta ação é irreversível. Tem a certeza de que deseja excluir a sua conta permanentemente?');
    
    if (confirmacao1) {
      const confirmacao2 = prompt('Para confirmar a exclusão, digite "EXCLUIR MINHA CONTA" no campo abaixo:');
      
      if (confirmacao2 === 'EXCLUIR MINHA CONTA') {
        this.http.delete(`${this.apiUrl}/usuarios/conta`).subscribe({
          next: () => {
            alert('A sua conta foi excluída permanentemente.');
            localStorage.clear();
            this.router.navigate(['/login']);
          },
          error: () => this.mostrarToast('Erro ao excluir a conta. Tente novamente mais tarde.', 'erro')
        });
      } else {
        this.mostrarToast('Exclusão cancelada. O texto de confirmação está incorreto.', 'aviso');
      }
    }
  }
}