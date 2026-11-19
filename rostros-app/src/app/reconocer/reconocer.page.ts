import { Component, computed, effect, inject, signal } from '@angular/core';

import { FotoCapturada } from '../services/camara.service';
import {
  ReconocimientoRespuesta,
  RostrosService,
  mensajeDeError,
  nombreLegible,
} from '../services/rostros.service';

@Component({
  selector: 'app-reconocer',
  templateUrl: 'reconocer.page.html',
  styleUrls: ['reconocer.page.scss'],
  standalone: false,
})
export class ReconocerPage {
  private readonly rostros = inject(RostrosService);

  readonly foto = signal<FotoCapturada | null>(null);
  readonly cargando = signal(false);
  readonly resultado = signal<ReconocimientoRespuesta | null>(null);
  readonly error = signal('');

  readonly puedeReconocer = computed(() => !!this.foto() && !this.cargando());

  readonly nombreLegible = nombreLegible;

  constructor() {
    effect(() => {
      this.foto();
      this.resultado.set(null);
      this.error.set('');
    });
  }

  async reconocer(): Promise<void> {
    const foto = this.foto();
    if (!foto) {
      return;
    }
    this.cargando.set(true);
    this.error.set('');
    this.resultado.set(null);
    try {
      this.resultado.set(await this.rostros.reconocer(foto.base64));
    } catch (error) {
      this.error.set(mensajeDeError(error));
    } finally {
      this.cargando.set(false);
    }
  }
}
