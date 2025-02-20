import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { Dog } from '../../models/dog';
import { CardComponent } from '../../components/card/card.component';
import { FiltersBarComponent } from '../../components/filters-bar/filters-bar.component';
import { FavoriteListHandlerService } from '../../services/favorite-list-handler/favorite-list-handler.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CommonModule, Location } from '@angular/common';
import { LoaderComponent } from '../../components/loader/loader.component';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { DogsService } from '../../services/dogs/dogs.service';

@Component({
  selector: 'app-favorites-list',
  standalone: true,
  imports: [HeaderComponent, CardComponent, FiltersBarComponent, CommonModule, LoaderComponent, MatButtonModule],
  templateUrl: './favorites-list.component.html',
  styleUrl: './favorites-list.component.scss'
})
export class FavoritesListComponent {

  isLoading = new BehaviorSubject<boolean>(false);
  doggies: any[] = [];

  filtersConfig = {
    filters: false,
    sorts: true
  }

  sort: {key: string, direction: 'asc' | 'desc'} = { key: 'breed', direction: 'asc' };

  dogsSubs = new Subscription(); 
  favoritesSubs = new Subscription();

  constructor(private listHandlerService: FavoriteListHandlerService, private router: Router, private dogService: DogsService, private route: ActivatedRoute, private location: Location) {

  }

  ngOnInit() {
    this.listHandlerService.updateFavoriteDogs();

    this.favoritesSubs = this.listHandlerService.favoriteDogs.subscribe(dogsList => {
      this.getDogs(dogsList);
    });

    this.route.queryParams.subscribe(async (params) => {
      if (params['sort']) {
        const aux = params['sort'].split(':');
        this.sort = {key: aux[0], direction: aux[1]};

        if(this.doggies) this.sortData(aux[0], aux[1]);
      }
    });
  }

  getDogs(dogIds: string[]) {
    this.dogsSubs = this.dogService.postDogs(dogIds).subscribe((res: any) => {
      this.doggies = res.body;
      this.sortData(this.sort.key, this.sort.direction);
    });
  }

  goToMatch() {
    this.router.navigate(['/user/matching'])
  }

  // Función para ordenar los datos por un key específico y en orden ascendente o descendente
  sortData(key: string, order: 'asc' | 'desc') {
    this.doggies.sort((a, b) => {
      if (a[key] < b[key]) {
        return order === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  goHome() {
    this.router.navigate(['/user/dogs-list'])
  }

  ngOnDestroy() {
    if(this.dogsSubs) this.dogsSubs.unsubscribe();
    if(this.favoritesSubs) this.favoritesSubs.unsubscribe();
  }
}

