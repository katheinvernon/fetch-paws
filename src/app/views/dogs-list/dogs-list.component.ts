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

@Component({
  selector: 'app-dogs-list',
  standalone: true,
  imports: [HeaderComponent, MatCardModule, MatButtonModule, CardComponent, FiltersBarComponent, MatPaginatorModule, CommonModule, LoaderComponent],
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

  constructor(private dogService: DogsService, private route: ActivatedRoute, private router: Router,) {

  }

  ngOnInit() {
    this.getFilters().then(res => {
      this.getDogs(res);
    }).catch(error => {
      console.error('Error getting filters information', error);
    });
  }

  getFilters(filtersChanged?: boolean): Promise<object> {
    return new Promise((resolve) => {
      const params = this.route.snapshot.queryParams;
      let query = {};

      if (params['breeds']) query = { breeds: JSON.parse(params['breeds']) };
      if (params['zipCodes']) query = { ...query, zipCodes: JSON.parse(params['zipCodes']) };
      if (params['ageMin']) query = { ...query, ageMin: params['ageMin'] };
      if (params['ageMax']) query = { ...query, ageMax: params['ageMax'] };
      if (params['sort']) query = { ...query, sort: params['sort'] };

      if (params['size']) {
        query = { ...query, size: params['size'] };
        this.pageSize = params['size'];
      } else {
        query = { ...query, size: this.pageSize };
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {size: this.pageSize},
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }

      if (!filtersChanged) {
        if (params['from']) {
          query = { ...query, from: params['from'] };
          this.pageIndex = params['from'] / params['size'];
        } else {
          query = { ...query, from: this.pageIndex };
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {from: this.pageIndex},
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
        }
      } else {
        this.pageIndex = 0;
        query = { ...query, from: 0 };
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {from: 0},
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }

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

  handlePageEvent(e: PageEvent) {
    this.isLoading.next(true);
    this.setPaginationValues(e).then(() => {
      this.getFilters().then(res => {
        this.getDogs(res);
        this.isLoading.next(false);
      }).catch(error => {
        console.error('Error getting filters information', error);
        this.isLoading.next(false);
      });
    }).catch(error => {
      console.error('Error setting paginator information', error);
      this.isLoading.next(false);
    });
  }

  setPaginationValues(e: PageEvent): Promise<void> {
    return new Promise((resolve) => {
      if (this.pageSize != e.pageSize) {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { size: e.pageSize, from: '0' },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      } else {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {from: e.pageIndex * e.pageSize},
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }

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
    this.router.navigate(['/user/matching'])
  }
}
