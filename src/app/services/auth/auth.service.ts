import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import endpoints from '../../constants/endpoints';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isAuthenticated = new BehaviorSubject<boolean>(false);
  isAuthenticated$: Observable<boolean> = this.isAuthenticated.asObservable();

  constructor(private apiService: ApiService, public http: HttpClient) { 
    if(localStorage.getItem('isAuthenticated')) {
      this.isAuthenticated.next(true);
    }
  }

  login(value: {email: string, name: string}) {
    return this.http.post(`${environment.apiUrl}${endpoints.LOGIN}`, value, {observe: 'response', withCredentials: true, responseType: 'text'});
  }

  logout() {
    return this.http.post(`${environment.apiUrl}${endpoints.LOGOUT}`, {observe: 'response', withCredentials: true, responseType: 'text'});
  }

  authenticationHandler(authenticated: boolean) {
    this.isAuthenticated.next(authenticated);
  }

  get isAuthenticatedValue() {
    return this.isAuthenticated.value;
  }
}
