import { Component, inject, input, model, signal } from '@angular/core';

import { CamaraService, FotoCapturada } from '../../services/camara.service';
import { mensajeDeError } from '../../services/rostros.service';

@Component({
  selector: 'app-selector-foto',
  templateUrl: './selector-foto.component.html',
  styleUrls: ['./selector-foto.component.scss'],
  standalone: false,
})
export class SelectorFotoComponent {
  private readonly camara = inject(CamaraService);

  readonly foto = model<FotoCapturada | null>(null);
  readonly deshabilitado = input(false);

  readonly procesando = signal(false);
  readonly error = signal('');

  tomar(): Promise<void> {
    return this.obtener(() => this.camara.tomarFoto());
  }

  galeria(): Promise<void> {
    return this.obtener(() => this.camara.elegirDeGaleria());
  }

  private async obtener(accion: () => Promise<FotoCapturada | null>): Promise<void> {
    this.procesando.set(true);
    this.error.set('');
    try {
      const nueva = await accion();
      if (nueva) {
        this.foto.set(nueva);
      }
    } catch (error) {
      this.error.set(mensajeDeError(error));
    } finally {
      this.procesando.set(false);
    }
  }
}
