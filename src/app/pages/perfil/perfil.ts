import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html'
})
export class Perfil implements OnInit {
  perfil: any = {};
  editando = false;
  meuId: number | null = null;
  apiUrl = 'http://localhost:8080/api/usuarios';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.extrairMeuId();
    if (this.meuId) {
      this.carregarPerfil();
    }
  }

  extrairMeuId() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      try {
        let base64Url = token.split('.')[1];
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) { base64 += '='; }
        const payload = JSON.parse(window.atob(base64));
        this.meuId = payload.id;
      } catch (e) {
        console.error('Erro ao decodificar token JWT.', e);
      }
    }
  }

  carregarPerfil() {
    this.http.get(`${this.apiUrl}/${this.meuId}`).subscribe({
      next: (res) => {
        this.perfil = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao buscar perfil:', err)
    });
  }

fazerUploadFoto(event: any) {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('arquivo', file);

      // Usa a sua rota existente de upload
      this.http.post<any>(`http://localhost:8080/api/upload`, formData).subscribe({
        next: (res) => {
          this.perfil.fotoPerfil = res.url; // Atualiza a foto localmente antes de salvar
          this.cdr.detectChanges();
        },
        error: (err) => alert('Erro ao fazer upload da imagem.')
      });
    }
  }

  salvarPerfil() {
    const body = {
      nome: this.perfil.nome,
      fotoPerfil: this.perfil.fotoPerfil,
      biografia: this.perfil.biografia,
      telefone: this.perfil.telefone,
      localizacao: this.perfil.localizacao,
      estadoCivil: this.perfil.estadoCivil,
      dataNascimento: this.perfil.dataNascimento,
      nomeParceiro: this.perfil.nomeParceiro
    };

    this.http.put(`${this.apiUrl}/perfil`, body).subscribe({
      next: (res: any) => {
        this.perfil = res;
        this.editando = false;
        
        localStorage.setItem('nomeUsuario', res.nome); 
        
        this.cdr.detectChanges();
        window.location.reload(); 
      },
      error: (err) => alert('Erro ao salvar o perfil. Verifique os dados.')
    });
  }

  cancelarEdicao() {
    this.editando = false;
    this.carregarPerfil();
  }

  gerarAvatar(nome: string): string {
    if (!nome) return 'https://ui-avatars.com/api/?name=U&background=2861d6&color=fff&size=150';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=2861d6&color=fff&size=150`;
  }
}