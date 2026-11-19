import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';

import { CompartidoModule } from '../compartido/compartido.module';
import { ReconocerPage } from './reconocer.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    CompartidoModule,
    RouterModule.forChild([{ path: '', component: ReconocerPage }]),
  ],
  declarations: [ReconocerPage],
})
export class ReconocerPageModule {}
