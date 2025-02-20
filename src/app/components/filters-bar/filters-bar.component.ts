import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { DogsService } from '../../services/dogs/dogs.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

//bottom sheet
@Component({
  selector: 'bottom-sheet',
  templateUrl: 'bottom-sheet.html',
  imports: [MatListModule, MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatIconModule, MatInputModule, MatSliderModule,
    MatChipsModule, MatAutocompleteModule],
})
export class BottomSheet {
  private _bottomSheetRef =
    inject<MatBottomSheetRef<BottomSheet>>(MatBottomSheetRef);

  breedsSelector = [];
  zipCode = '';
  zipCodesSelected: string[] = [];
  minAge = 0;
  maxAge = 20;

  breeds = [];

  temporaryFilters: { key: 'breeds' | 'age' | 'zipCodes', value: any }[] = [];
  filtersApplied = false;

  breedsSubs = new Subscription();
  @Output() filtersChanged = new EventEmitter<boolean>();

  readonly addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA, SPACE] as const;

  private _snackBar = inject(MatSnackBar);

  constructor(private dogServices: DogsService, private route: ActivatedRoute, private router: Router, private bottomSheetRef: MatBottomSheetRef<BottomSheet>) {
    this.bottomSheetRef.afterDismissed().subscribe(() => {
      if (this.temporaryFilters) {
        this.getFilters();
        this.temporaryFilters = [];
      }
    });
  }

  ngOnInit() {
    this.getBreeds();
    this.getFilters();
  }

  getBreeds() {
    this.breedsSubs = this.dogServices.getAllBreeds().subscribe((res: any) => {
      this.breeds = res.body;
    });
  }

  addZipCode(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (!this.zipCodesSelected.some(zc => zc === value) && this.zipCode !== '') {
      if (this.validZipCode()) {
        this.zipCodesSelected.push(value);
        // this.filtersHandler('zipCodes', this.zipCodesSelected);
        this.setTemporaryFilters('zipCodes', this.zipCodesSelected);
        this.zipCode = '';

        // Clear the input value
        event.chipInput!.clear();

      } else {
        this.openSnackBar('Zip code not valid', 'Ok');
      }
    } else if (this.zipCodesSelected.some(zc => zc === value)) {
      this.openSnackBar('Zip code already added', 'Ok');
    }
  }

  removeZipCode(zipCode: string): void {
    this.zipCodesSelected = this.zipCodesSelected.filter(zc => zc !== zipCode);
    // this.filtersHandler('zipCodes', this.zipCodesSelected);
    this.setTemporaryFilters('zipCodes', this.zipCodesSelected);
  }

  validZipCode() {
    const onlyNumbers = /^[0-9]*$/;
    return onlyNumbers.test(this.zipCode) && this.zipCode.length == 5;
  }

  breedsSelectionHandler() {
    // this.filtersHandler('breeds', this.breedsSelector);
    this.setTemporaryFilters('breeds', this.breedsSelector);
  }

  ageRangeHandler() {
    // this.filtersHandler('age', { minAge: this.minAge, maxAge: this.maxAge });
    this.setTemporaryFilters('age', { minAge: this.minAge, maxAge: this.maxAge });
  }

  //Filters
  filtersHandler(key: 'breeds' | 'age' | 'zipCodes', value: any) {
    if (key === 'age') {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { ageMin: value.minAge, ageMax: value.maxAge },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    } else {
      let aux = value;

      if (value instanceof Array) {
        aux = JSON.stringify(value);
      }
      const queryParam = { [key]: aux };
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: queryParam,
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }

  saveFilters(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.temporaryFilters.length > 0) {
        let queryParam = {};

        try {
          this.temporaryFilters.forEach(tf => {
            if (tf.key === 'age') {
              queryParam = { ...queryParam, ageMin: tf.value.minAge, ageMax: tf.value.maxAge };
            } else {
              let aux = tf.value;
              if (tf.value instanceof Array) {
                aux = JSON.stringify(tf.value);
              }

              queryParam = { ...queryParam, [tf.key]: aux };
            }
          });

          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: queryParam,
            queryParamsHandling: 'merge',
            replaceUrl: true,
          }).then(() => {
            this.temporaryFilters = [];
            resolve();
          }).catch((error) => {
            this.openSnackBar('An error occurred during navigation', 'Ok');
            reject(error);
          });

        } catch (error) {
          this.openSnackBar('Error processing filters', 'Ok');
          reject(error);
        }
      } else {
        this.openSnackBar('There are no filter changes to apply', 'Ok');
        resolve();
      }
    });
  }

  applyFilters() {
    this.saveFilters().then(() => {
      this.filtersChanged.emit(true);
      this.closeBottomSheet();
    }).catch((error: any) => {
      console.error('Error applying filters', error);
      this.openSnackBar('Error applying filters', 'Ok');
    })

  }

  clearFilters() {
    this.clearFilterValues()
      .then(() => {
        this.filtersChanged.emit(true);
      })
      .catch((error) => {
        console.error('Error clearing filters', error);
        this.openSnackBar('Error clearing filters', 'Ok');
      });
  }

  clearFilterValues(): Promise<void> {
    return new Promise((resolve) => {
      this.breedsSelector = [];
      this.zipCodesSelected = [];
      this.zipCode = '';
      this.minAge = 0;
      this.maxAge = 20;

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { breeds: null, zipCodes: null, ageMin: 0, ageMax: 20 },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });

      resolve();
    })
  }

  setTemporaryFilters(key: 'breeds' | 'age' | 'zipCodes', value: any) {
    if (this.temporaryFilters.length > 0) {
      const filterIndex = this.temporaryFilters.findIndex(filter => filter.key == key);
      if (filterIndex !== -1) {
        this.temporaryFilters[filterIndex].value = value;
      } else {
        this.temporaryFilters.push({ key, value });
      }
    } else {
      this.temporaryFilters.push({ key, value });
    }
  }

  getFilters() {
    const params = this.route.snapshot.queryParams;
    if (params['breeds']) this.breedsSelector = JSON.parse(params['breeds']);
    if (params['zipCodes']) this.zipCodesSelected = JSON.parse(params['zipCodes']);
    if (params['ageMin']) this.minAge = +params['ageMin'];
    if (params['ageMax']) this.maxAge = +params['ageMax'];
  }

  closeBottomSheet(): void {
    this.bottomSheetRef.dismiss();
  }

  openSnackBar(message: string, action?: string) {
    this._snackBar.open(message, action, {
      duration: 2000
    });
  }

  ngOnDestroy() {
    if (this.breedsSubs) this.breedsSubs.unsubscribe();
  }
}

//Filters Bar
@Component({
  selector: 'app-filters-bar',
  imports: [CommonModule],
  templateUrl: './filters-bar.component.html',
  styleUrl: './filters-bar.component.scss'
})

export class FiltersBarComponent {
  private _bottomSheet = inject(MatBottomSheet);

  @Output() filtersChanged = new EventEmitter<boolean>();

  @Input() config = {
    filters: true,
    sorts: true
  }

  filtersSubs = new Subscription();

  sortingElements: {
    key: string,
    label: string,
    active: boolean,
    direction: 'asc' | 'desc'
  }[] = [
      {
        key: 'BREED',
        label: 'Breed',
        active: false,
        direction: 'asc'
      },
      {
        key: 'AGE',
        label: 'Age',
        active: false,
        direction: 'asc'
      },
      {
        key: 'NAME',
        label: 'Name',
        active: false,
        direction: 'asc'
      },
    ];

  constructor(private route: ActivatedRoute, private router: Router,) {
    const params = this.route.snapshot.queryParams;
    if (params['sort']) {
      const aux = params['sort'].split(':');
      this.sortHandler(aux[0], undefined, aux[1], true);
    } else {
      this.sortHandler('BREED', 0, undefined, true);
    }
  }

  /**
   * @description handle the sorting functionality
   * @param sortIndex Index of the sort (based on sortingElements array)
   * @param key sort key (based on sortingElements array)
   * @param direction sort direction
   * @param initializing to check if it's called by the constructor
   */
  sortHandler(key: string, sortIndex?: number, direction?: 'asc' | 'desc', initializing?: boolean) {
    this.setSortValues(key, sortIndex, direction, initializing).then(() => {
      if (!initializing) {
        this.filtersChanged.emit(true);
      }
    }).catch(error => {
      console.error('Error in sorting', error);
    });
  }

  setSortValues(key: string, sortIndex?: number, direction?: 'asc' | 'desc', initializing?: boolean): Promise<void> {
    return new Promise((resolve) => {
      if (sortIndex !== undefined && sortIndex !== -1) {
        if (!this.sortingElements[sortIndex].active) {
          this.sortingElements.forEach(sort => sort.active = false);
          this.sortingElements[sortIndex].active = true;
          this.sortingElements[sortIndex].direction = 'asc';
        } else if (this.sortingElements[sortIndex].active && this.sortingElements[sortIndex].direction === 'asc') {
          this.sortingElements[sortIndex].direction = 'desc';
        } else {
          this.sortingElements[sortIndex].direction = 'asc';
        }

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { sort: `${this.sortingElements[sortIndex].key.toLowerCase()}:${this.sortingElements[sortIndex].direction}` },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });

        resolve();
      } else {
        const index = this.sortingElements.findIndex(e => e.key === key.toUpperCase());
        this.sortingElements[index].active = true;
        this.sortingElements[index].direction = direction ?? 'asc';
        resolve();
      }
    })
  }

  openBottomSheet(): void {
    const bottomSheetRef = this._bottomSheet.open(BottomSheet);

    this.filtersSubs = bottomSheetRef.instance.filtersChanged.subscribe(res => {
      this.filtersChanged.emit(true)
    });
  }

  ngOnDestroy() {
    this.filtersSubs.unsubscribe();
  }
}
function resolve() {
  throw new Error('Function not implemented.');
}

function reject(error: any) {
  throw new Error('Function not implemented.');
}

