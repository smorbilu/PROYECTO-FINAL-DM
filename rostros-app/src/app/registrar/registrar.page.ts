import { Component, computed, inject, signal } from '@angular/core';

import { FotoCapturada } from '../services/camara.service';
import {
  RegistroRespuesta,
  RostrosService,
  aIdentificador,
  mensajeDeError,
  nombreLegible,
} from '../services/rostros.service';

@Component({
  selector: 'app-registrar',
  templateUrl: 'registrar.page.html',
  styleUrls: ['registrar.page.scss'],
  standalone: false,
})
export class RegistrarPage {
  private readonly rostros = inject(RostrosService);

  readonly nombre = signal('');
  readonly foto = signal<FotoCapturada | null>(null);
  readonly cargando = signal(false);
  readonly resultado = signal<RegistroRespuesta | null>(null);
  readonly error = signal('');

  readonly identificador = computed(() => aIdentificador(this.nombre()));
  readonly puedeRegistrar = computed(() => !!this.identificador() && !!this.foto() && !this.cargando());

  readonly nombreLegible = nombreLegible;

  async registrar(): Promise<void> {
    const foto = this.foto();
    const id = this.identificador();
    if (!foto || !id) {
      return;
    }
    this.cargando.set(true);
    this.error.set('');
    this.resultado.set(null);
    try {
      this.resultado.set(await this.rostros.registrar(id, foto.base64));
    } catch (error) {
      this.error.set(mensajeDeError(error));
    } finally {
      this.cargando.set(false);
    }
  }

  nuevoRegistro(): void {
    this.nombre.set('');
    this.foto.set(null);
    this.resultado.set(null);
    this.error.set('');
  }
}
