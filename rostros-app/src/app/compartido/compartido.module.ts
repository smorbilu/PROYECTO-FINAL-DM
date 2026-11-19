import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';

import { SelectorFotoComponent } from './selector-foto/selector-foto.component';

@NgModule({
  imports: [CommonModule, IonicModule],
  declarations: [SelectorFotoComponent],
  exports: [SelectorFotoComponent],
})
export class CompartidoModule {}
