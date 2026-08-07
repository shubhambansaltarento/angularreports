import { Routes } from '@angular/router';

export const GOODS_ACKNOWLEDGEMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/goods-acknowledgement-list/goods-acknowledgement-list.component').then(
        (m) => m.GoodsAcknowledgementListComponent,
      ),
  },
];
