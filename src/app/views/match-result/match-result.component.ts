import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { Dog } from '../../models/dog';
import { DogsService } from '../../services/dogs/dogs.service';
import { FavoriteListHandlerService } from '../../services/favorite-list-handler/favorite-list-handler.service';
import { LoaderComponent } from '../../components/loader/loader.component';
import { BehaviorSubject, map, of, switchMap } from 'rxjs';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-match-result',
  standalone: true,
  imports: [HeaderComponent, LoaderComponent, CommonModule, MatButtonModule],
  templateUrl: './match-result.component.html',
  styleUrl: './match-result.component.scss'
})
export class MatchResultComponent {

  dog: any;
  isLoading = new BehaviorSubject<boolean>(true);

  constructor(private dogService: DogsService, private listHandlerService: FavoriteListHandlerService, private router: Router, private location: Location) {
    this.listHandlerService.updateFavoriteDogs();

    this.listHandlerService.favoriteDogs.subscribe(dogsList => {
      this.getMatch(dogsList);
    });
  }

  getMatch(dogs: string[]) {
    this.dogService.getMatch(dogs).subscribe((res: any) => {
      return res.body;
    });

    this.dogService.getMatch(dogs).pipe(
      map(res => res.body),
      switchMap(body => {
        if (body) {
          return this.dogService.postDogs([body.match]);
        }
        return of(null);
      })
    ).subscribe((res: any) => {
      this.dog = res.body[0];
      this.isLoading.next(false);
    });
  }

  goBack() {
    this.location.back();
  }
}
