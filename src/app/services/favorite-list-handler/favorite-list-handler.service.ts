import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoriteListHandlerService {

  favoriteDogs = new BehaviorSubject<string[]>([]);
  private _snackBar = inject(MatSnackBar);

  constructor() {

  }

  deleteFromFavorites(dogId: string) {
    if (this.favoriteDogsList !== '') {
      const auxFavoriteDogsList = this.favoriteDogsList.filter((dog: string) => dog !== dogId);

      this.updateLocalStorage(JSON.stringify(auxFavoriteDogsList));
      this.updateFavoriteDogs();
    } else {
      this.openSnackBar('Oops, something goes wrong', 'Ok');
    }
  }

  addToFavorites(dogId: string) {
    if (this.favoriteDogsList.length > 0) {
      let auxFavoriteDogsList = this.favoriteDogsList;
      auxFavoriteDogsList.push(dogId);

      this.updateLocalStorage(JSON.stringify(auxFavoriteDogsList));
      this.updateFavoriteDogs();

    } else {
      this.updateLocalStorage(JSON.stringify([dogId]));
      this.updateFavoriteDogs();
    }
  }

  updateLocalStorage(value: string) {
    localStorage.setItem('favoriteDogs', value);
  }

  updateFavoriteDogs() {
    const favoriteDogsLocal = JSON.parse(localStorage.getItem('favoriteDogs') || '[]');
    this.favoriteDogs.next(favoriteDogsLocal);
  }

  checkIfItsFavorite(dogId: string) {
    if (this.favoriteDogsList.length > 0) {
      return this.favoriteDogsList.some((dog: string) => dog === dogId);
    }
  }

  openSnackBar(message: string, action?: string) {
    this._snackBar.open(message, action, {
      duration: 2000
    });
  }

  get favoriteDogsList(): any {
    return this.favoriteDogs.getValue();
  }
}
