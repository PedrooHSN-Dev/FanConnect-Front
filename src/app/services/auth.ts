import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiUrl = 'http://localhost:8080/api/usuarios';

  constructor(private http: HttpClient) {}

  login(credenciais: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credenciais); 
  }

  register(dados: any): Observable<any> {
    return this.http.post(this.apiUrl, dados, { responseType: 'text' });
  }

  activate(dados: { codigo: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/ativar-conta`, dados, { responseType: 'text' });
  }

  esqueciSenha(dados: { email: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/esqueci-senha`, dados, { responseType: 'text' });
  }

  redefinirSenha(dados: { codigo: string, novaSenha: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/redefinir-senha`, dados, { responseType: 'text' });
  }
}