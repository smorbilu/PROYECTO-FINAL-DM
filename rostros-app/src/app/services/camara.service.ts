import { Injectable } from '@angular/core';
import { Camera, CameraDirection, MediaResult, MediaTypeSelection } from '@capacitor/camera';

export interface FotoCapturada {
  vista: string;
  base64: string;
}

const LADO_MAXIMO = 1024;
const CALIDAD_JPEG = 0.85;

@Injectable({ providedIn: 'root' })
export class CamaraService {
  async tomarFoto(): Promise<FotoCapturada | null> {
    try {
      const resultado = await Camera.takePhoto({
        quality: 85,
        correctOrientation: true,
        cameraDirection: CameraDirection.Front,
      });
      return await this.procesar(resultado);
    } catch (error) {
      if (this.esCancelacion(error)) {
        return null;
      }
      throw error;
    }
  }

  async elegirDeGaleria(): Promise<FotoCapturada | null> {
    try {
      const { results } = await Camera.chooseFromGallery({
        mediaType: MediaTypeSelection.Photo,
        allowMultipleSelection: false,
        quality: 85,
      });
      return results.length > 0 ? await this.procesar(results[0]) : null;
    } catch (error) {
      if (this.esCancelacion(error)) {
        return null;
      }
      throw error;
    }
  }

  private async procesar(resultado: MediaResult): Promise<FotoCapturada> {
    const origen = resultado.webPath ?? this.comoDataUrl(resultado.thumbnail);
    if (!origen) {
      throw new Error('No se pudo leer la foto.');
    }
    const imagen = await this.cargarImagen(origen);
    const escala = Math.min(1, LADO_MAXIMO / Math.max(imagen.naturalWidth, imagen.naturalHeight));
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.round(imagen.naturalWidth * escala);
    lienzo.height = Math.round(imagen.naturalHeight * escala);
    const contexto = lienzo.getContext('2d');
    if (!contexto) {
      throw new Error('No se pudo procesar la foto.');
    }
    contexto.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
    const vista = lienzo.toDataURL('image/jpeg', CALIDAD_JPEG);
    return { vista, base64: vista.split(',')[1] };
  }

  private comoDataUrl(base64?: string): string | undefined {
    if (!base64) {
      return undefined;
    }
    return base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`;
  }

  private cargarImagen(origen: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const imagen = new Image();
      imagen.onload = () => resolve(imagen);
      imagen.onerror = () => reject(new Error('No se pudo abrir la foto.'));
      imagen.src = origen;
    });
  }

  private esCancelacion(error: unknown): boolean {
    const mensaje = error instanceof Error ? error.message : String(error);
    return /cancel/i.test(mensaje);
  }
}
