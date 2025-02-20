import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(public http: HttpClient) { }

  /**
   * @description transforms an object into a string
   * @param obj object to transform
   * @param prefix used when the property is an object
   * @returns string with the query params
   */ 
  objectToQueryParams(obj: any, prefix = ''): string {
    const queryParams = [];

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];

        if (Array.isArray(value)) {
          value.forEach(item => {
            queryParams.push(`${encodeURIComponent(`${prefix}${key}`)}=${encodeURIComponent(item)}`);
          });
        } else if (typeof value === 'object' && value !== null) {
          queryParams.push(this.objectToQueryParams(value, `${prefix}${key}.`));
        } else {
          queryParams.push(`${encodeURIComponent(`${prefix}${key}`)}=${encodeURIComponent(value)}`);
        }
      }
    }

    return queryParams.join('&');
  }

  queryParamsEncodeder(obj: any) {
    return obj ? '?' + this.objectToQueryParams(obj) : '';
  }

  get<T>(path: string, query: object | undefined = undefined): Observable<HttpResponse<T>> {
    return this.http.get<T>(`${environment.apiUrl}${path}${this.queryParamsEncodeder(query)}`, {observe: 'response', withCredentials: true});
  }
  post<T>(path: string, body: unknown | FormData = {}, query = {}): Observable<T> {
    return this.http.post<T>(`${environment.apiUrl}${path}${this.queryParamsEncodeder(query)}`, {observe: 'response', withCredentials: true});
  }      
  async put<T>(path: string, body: unknown | FormData = {}, query = {}): Promise<T> {
    return await lastValueFrom(
      this.http.put<T>(`${environment.apiUrl}${path}${this.queryParamsEncodeder(query)}`, body),
    );
  }
  async patch<T>(path: string, body: unknown | FormData = {}, query = {}): Promise<T> {
    return await lastValueFrom(
      this.http.patch<T>(`${environment.apiUrl}${path}${this.queryParamsEncodeder(query)}`, body),
    );
  }

  async delete<T>(path: string, query = {}): Promise<T> {
    return await lastValueFrom(
      this.http.delete<T>(`${environment.apiUrl}${path}${this.queryParamsEncodeder(query)}`),
    );
  }
}