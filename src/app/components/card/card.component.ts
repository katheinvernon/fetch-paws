import { Component, Input } from '@angular/core';
import { Dog } from '../../models/dog';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FavoriteListHandlerService } from '../../services/favorite-list-handler/favorite-list-handler.service';

@Component({
  selector: 'app-card',
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {

  @Input() dog: Dog = {
    id: '',
    img: '',
    name: '',
    breed: '',
    age: 0,
    zip_code: ''
  };

  isFavorite = new BehaviorSubject<boolean>(false);

  constructor(private listHandlerService: FavoriteListHandlerService) {
    this.listHandlerService.updateFavoriteDogs();
  }
  
  ngOnInit() {
    this.isFavorite.next(this.listHandlerService.checkIfItsFavorite(this.dog.id));
  }

  deleteFromFavorites() {
    this.listHandlerService.deleteFromFavorites(this.dog.id);
    this.isFavorite.next(this.listHandlerService.checkIfItsFavorite(this.dog.id));
  }
  
  addToFavorites() {
    this.listHandlerService.addToFavorites(this.dog.id);
    this.isFavorite.next(this.listHandlerService.checkIfItsFavorite(this.dog.id));
  }
}
