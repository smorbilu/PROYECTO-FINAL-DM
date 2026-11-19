import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';

import { RostrosPage } from './rostros.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild([{ path: '', component: RostrosPage }]),
  ],
  declarations: [RostrosPage],
})
export class RostrosPageModule {}
