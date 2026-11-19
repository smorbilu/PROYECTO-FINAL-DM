import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';

import { CompartidoModule } from '../compartido/compartido.module';
import { RegistrarPage } from './registrar.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CompartidoModule,
    RouterModule.forChild([{ path: '', component: RegistrarPage }]),
  ],
  declarations: [RegistrarPage],
})
export class RegistrarPageModule {}
