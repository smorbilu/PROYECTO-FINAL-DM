import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'registrar',
        loadChildren: () => import('../registrar/registrar.module').then(m => m.RegistrarPageModule)
      },
      {
        path: 'reconocer',
        loadChildren: () => import('../reconocer/reconocer.module').then(m => m.ReconocerPageModule)
      },
      {
        path: 'rostros',
        loadChildren: () => import('../rostros/rostros.module').then(m => m.RostrosPageModule)
      },
      {
        path: '',
        redirectTo: 'registrar',
        pathMatch: 'full'
      },
    ]
  },
  {
    path: '',
    redirectTo: 'tabs/registrar',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [TabsPage],
})
export class TabsPageModule {}
