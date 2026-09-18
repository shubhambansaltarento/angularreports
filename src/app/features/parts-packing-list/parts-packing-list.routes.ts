import { Routes } from '@angular/router';
import { PartsPackingListService } from './services/parts-packing-list.service';
import { PartsPackingListStore } from './store/parts-packing-list.store';

/** Lazy-loaded route table for the Parts Packing List feature. */
export const PARTS_PACKING_LIST_ROUTES: Routes = [
  {
    path: '',
    providers: [PartsPackingListStore, PartsPackingListService],
    loadComponent: () =>
      import('./pages/parts-packing-list-list/parts-packing-list-list.component').then(
        (m) => m.PartsPackingListListComponent,
      ),
  },
];
