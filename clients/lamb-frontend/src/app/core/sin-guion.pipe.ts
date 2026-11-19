import { Pipe, PipeTransform } from '@angular/core';

/**
 * Regla del proyecto: en pantalla nunca se muestra el simbolo "_".
 * Los valores del backend (EN_EXTINCION, NO_APERTURADO...) se muestran como "EN EXTINCION".
 */
@Pipe({ name: 'sinGuion' })
export class SinGuion implements PipeTransform {
  transform(valor: unknown): string {
    return valor === null || valor === undefined ? '' : String(valor).replace(/_/g, ' ');
  }
}
