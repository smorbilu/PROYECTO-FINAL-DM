import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';

export interface RegistroRespuesta {
  registrado: boolean;
  id: string;
  faceId: string;
  confianza: number;
}

export interface ReconocimientoRespuesta {
  match: boolean;
  id?: string;
  similarity?: number;
}

export interface Rostro {
  id: string;
  faceId: string;
}

export interface ListaRostros {
  total: number;
  rostros: Rostro[];
}

export interface EliminacionRespuesta {
  eliminado: boolean;
  id: string;
  rostrosEliminados: number;
}

export function aIdentificador(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_.-]/g, '')
    .slice(0, 60);
}

export function nombreLegible(id: string): string {
  return id
    .split(/[_.-]+/)
    .filter(parte => parte.length > 0)
    .map(parte => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(' ');
}

export function mensajeDeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'No hay conexión con el servidor. Revisa tu internet.';
    }
    const mensaje = error.error?.error ?? error.error?.message;
    if (typeof mensaje === 'string' && mensaje.length > 0) {
      return mensaje;
    }
    return `El servidor respondió con un error (${error.status}).`;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Ocurrió un error inesperado.';
}

@Injectable({ providedIn: 'root' })
export class RostrosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  registrar(id: string, imagenBase64: string): Promise<RegistroRespuesta> {
    return firstValueFrom(
      this.http.post<RegistroRespuesta>(`${this.apiUrl}/registrar`, { id, image: imagenBase64 })
    );
  }

  reconocer(imagenBase64: string): Promise<ReconocimientoRespuesta> {
    return firstValueFrom(
      this.http.post<ReconocimientoRespuesta>(`${this.apiUrl}/reconocer`, { image: imagenBase64 })
    );
  }

  listar(): Promise<ListaRostros> {
    return firstValueFrom(this.http.get<ListaRostros>(`${this.apiUrl}/rostros`));
  }

  eliminar(id: string): Promise<EliminacionRespuesta> {
    return firstValueFrom(
      this.http.delete<EliminacionRespuesta>(`${this.apiUrl}/rostros/${encodeURIComponent(id)}`)
    );
  }
}
