import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CardComponent } from '../../components/card/card.component';
import { Dog } from '../../models/dog';
import { FiltersBarComponent } from "../../components/filters-bar/filters-bar.component";
import { DogsService } from '../../services/dogs/dogs.service';
import { BehaviorSubject, Subscription, map, of, pipe, switchMap, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../../components/loader/loader.component';
import { FavoriteListHandlerService } from '../../services/favorite-list-handler/favorite-list-handler.service';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-dogs-list',
  standalone: true,
  imports: [HeaderComponent, MatCardModule, MatButtonModule, CardComponent, FiltersBarComponent, MatPaginatorModule, CommonModule, LoaderComponent, MatTooltip],
  templateUrl: './dogs-list.component.html',
  styleUrl: './dogs-list.component.scss'
})
export class DogsListComponent {
  doggies: Dog[] = [];

  length = 50;
  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25, 50];

  hidePageSize = false;
  showPageSizeOptions = true;
  showFirstLastButtons = true;
  disabled = false;

  pageEvent: PageEvent | undefined;

  isLoading = new BehaviorSubject<boolean>(false);
  hasFavorites = false;
  favoritesSubs = new Subscription();

  constructor(private dogService: DogsService, private route: ActivatedRoute, private router: Router, private listHandlerService: FavoriteListHandlerService,) {

  }

  ngOnInit() {
    this.isLoading.next(true);
    this.getFilters().then(res => {
      this.getDogs(res);
    }).catch(error => {
      console.error('Error getting filters information, please reload the page', error);
    });

    this.favoritesSubs = this.listHandlerService.favoriteDogs.subscribe(dogsList => {
      this.hasFavorites = dogsList.length > 0;
    });
  }

  getFilters(filtersChanged?: boolean): Promise<object> {
    return new Promise((resolve) => {
      const params = this.route.snapshot.queryParams;
      let query: any = {};

      if (params['breeds']) query = { breeds: JSON.parse(params['breeds']) };
      if (params['zipCodes']) query = { ...query, zipCodes: JSON.parse(params['zipCodes']) };
      if (params['ageMin']) query = { ...query, ageMin: params['ageMin'] };
      if (params['ageMax']) query = { ...query, ageMax: params['ageMax'] };
      if (params['sort']) query = { ...query, sort: params['sort'] };

      
      const pageSize = params['size'] || this.pageSize;
      let pageIndex = params['from'] ? params['from'] / pageSize : this.pageIndex;
      query = { ...query, size: pageSize, from: pageIndex};
      
      
      if (filtersChanged) {
        pageIndex = 0;
        query = { ...query, from: 0 };
      } 
      console.log('dsadasdasvff dfb', params['size'], params['from']);

      this.pageIndex = pageIndex;
      this.pageSize = pageSize;

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {from: query.from, size: query.size},
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });

      resolve(query);
    });
  }

  getDogs(query?: Object) {
    this.dogService.getAllDogs(query).pipe(
      map(res => res.body),
      switchMap(body => {
        if (body) {
          this.length = body.total;
          return this.dogService.postDogs(body.resultIds);
        }
        return of(null);

      })
    ).subscribe((res: any) => {
      this.doggies = res.body;
      this.isLoading.next(false);
    });
  }

  filtersListener(event: any) {
    this.getFilters(true).then(res => {
      this.getDogs(res);
    }).catch(error => {
      console.error('Error getting filters information', error);
    });
  }

  //Paginator

  async handlePageEvent(e: PageEvent) {
    this.isLoading.next(true);
    try {
      await this.setPaginationValues(e);
      const filtersQuery = await this.getFilters();
      this.getDogs(filtersQuery);
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading.next(false);
    }
  }

  setPaginationValues(e: PageEvent): Promise<void> {
    return new Promise((resolve) => {
      const from = this.pageSize != e.pageSize ? 0 : e.pageIndex * e.pageSize;

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {size: e.pageSize, from: from},
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });

      this.pageEvent = e;
      this.length = e.length;
      this.pageSize = e.pageSize;
      this.pageIndex = e.pageIndex;

      resolve();
    });
  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }

  goToMatch() {
    if (this.hasFavorites) {
      this.router.navigate(['/user/matching'])
    }
  }

  ngOnDestroy() {
    this.favoritesSubs.unsubscribe();
  }
}
