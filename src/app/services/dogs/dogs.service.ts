import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import endpoints from '../../constants/endpoints';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DogsService {

  constructor(private apiService: ApiService, public http: HttpClient) { }

  getAllBreeds(): Observable<HttpResponse<any>> {
    return this.apiService.get<any>(`${endpoints.BREEDS}`);
  }

  getAllDogs(query?: object): Observable<HttpResponse<any>> {
    return this.apiService.get<any>(`${endpoints.DOGS}${endpoints.SEARCH}`, query);
  }

  postDogs(body: string[]): Observable<HttpResponse<any>> {
    return this.http.post(`${environment.apiUrl}${endpoints.DOGS}`, body, {observe: 'response', withCredentials: true});
  }
  
  getMatch(dogs?: string[]): Observable<HttpResponse<any>> {
    return this.http.post(`${environment.apiUrl}${endpoints.DOGS}${endpoints.MATCH}`, dogs, {observe: 'response', withCredentials: true});
  }
}
