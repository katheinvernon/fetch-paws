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
    this.getFilters();
  }

  getFilters() {
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
      this.addQueryParam('size', this.pageSize);
    }

    if (params['from']) {
      query = { ...query, from: params['from'] };
      this.pageIndex = params['from'] / params['size'];
    } else {
      query = { ...query, from: this.pageIndex };
      this.addQueryParam('from', this.pageIndex);
    }

    this.getDogs(query);
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

  addQueryParam(key: string, value: string | number) {
    const queryParam = { [key]: value };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParam,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  filtersListener(event: any) {
    this.getFilters();
  }

  //Paginator

  handlePageEvent(e: PageEvent) {
    if(this.pageSize != e.pageSize) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {size: e.pageSize, from: '0'},
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    } else {
      this.addQueryParam('from', e.pageIndex * e.pageSize);
    }

    this.pageEvent = e;
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
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
