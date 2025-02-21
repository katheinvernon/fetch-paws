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
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-favorites-list',
  standalone: true,
  imports: [HeaderComponent, CardComponent, FiltersBarComponent, CommonModule, LoaderComponent, MatButtonModule, MatTooltip],
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
  hasFavorites = false;

  constructor(private listHandlerService: FavoriteListHandlerService, private router: Router, private dogService: DogsService, private route: ActivatedRoute, private location: Location) {

  }

  ngOnInit() {
    this.listHandlerService.updateFavoriteDogs();

    this.favoritesSubs = this.listHandlerService.favoriteDogs.subscribe(dogsList => {
      this.hasFavorites = dogsList.length > 0;
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

  /**
   * @description get the dogs that are on the favorite list
   * @param dogIds array with dog ids that are on the favorite list
   */
  getDogs(dogIds: string[]) {
    this.dogsSubs = this.dogService.postDogs(dogIds).subscribe((res: any) => {
      this.doggies = res.body;
      this.sortData(this.sort.key, this.sort.direction);
    });
  }

  goToMatch() {
    if(this.hasFavorites) {
      this.router.navigate(['/user/matching'])
    }
  }

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

