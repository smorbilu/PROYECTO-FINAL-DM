import { Component, computed, inject, signal } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular/lazy';

import { Rostro, RostrosService, mensajeDeError, nombreLegible } from '../services/rostros.service';

interface Persona {
  id: string;
  nombre: string;
  fotos: number;
}

@Component({
  selector: 'app-rostros',
  templateUrl: 'rostros.page.html',
  styleUrls: ['rostros.page.scss'],
  standalone: false,
})
export class RostrosPage {
  private readonly rostrosService = inject(RostrosService);
  private readonly alertas = inject(AlertController);
  private readonly avisos = inject(ToastController);

  readonly rostros = signal<Rostro[]>([]);
  readonly cargando = signal(false);
  readonly cargadoUnaVez = signal(false);
  readonly eliminando = signal<string | null>(null);
  readonly error = signal('');

  readonly personas = computed<Persona[]>(() => {
    const conteo = new Map<string, number>();
    for (const rostro of this.rostros()) {
      conteo.set(rostro.id, (conteo.get(rostro.id) ?? 0) + 1);
    }
    return [...conteo.entries()]
      .map(([id, fotos]) => ({ id, nombre: nombreLegible(id), fotos }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  });

  ionViewWillEnter(): void {
    void this.cargar();
  }

  async refrescar(evento: CustomEvent): Promise<void> {
    await this.cargar();
    (evento.target as HTMLIonRefresherElement).complete();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set('');
    try {
      const respuesta = await this.rostrosService.listar();
      this.rostros.set(respuesta.rostros);
    } catch (error) {
      this.error.set(mensajeDeError(error));
    } finally {
      this.cargando.set(false);
      this.cargadoUnaVez.set(true);
    }
  }

  async confirmarEliminar(persona: Persona): Promise<void> {
    const alerta = await this.alertas.create({
      header: 'Eliminar rostro',
      message: `¿Seguro que quieres eliminar a ${persona.nombre}? Ya no será reconocido.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive' },
      ],
    });
    await alerta.present();
    const { role } = await alerta.onDidDismiss();
    if (role === 'destructive') {
      await this.eliminar(persona);
    }
  }

  private async eliminar(persona: Persona): Promise<void> {
    this.eliminando.set(persona.id);
    try {
      await this.rostrosService.eliminar(persona.id);
      this.rostros.update(lista => lista.filter(rostro => rostro.id !== persona.id));
      await this.avisar(`${persona.nombre} fue eliminado`, 'success');
    } catch (error) {
      await this.avisar(mensajeDeError(error), 'danger');
    } finally {
      this.eliminando.set(null);
    }
  }

  private async avisar(mensaje: string, color: 'success' | 'danger'): Promise<void> {
    const aviso = await this.avisos.create({ message: mensaje, color, duration: 2500, position: 'top' });
    await aviso.present();
  }
}
