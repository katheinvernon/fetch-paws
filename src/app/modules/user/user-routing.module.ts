import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DogsListComponent } from '../../views/dogs-list/dogs-list.component';
import { FavoritesListComponent } from '../../views/favorites-list/favorites-list.component';
import { MatchResultComponent } from '../../views/match-result/match-result.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dogs-list',
    pathMatch: 'full',
  },
  {
    path: 'dogs-list',
    component: DogsListComponent
  },
  {
    path: 'favorites-list',
    component: FavoritesListComponent
  },
  {
    path: 'matching',
    component: MatchResultComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
