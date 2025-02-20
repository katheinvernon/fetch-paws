import { HttpErrorResponse, HttpEvent, HttpHandler, HttpHandlerFn, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { Observable, catchError, throwError } from 'rxjs';

export const AuthInterceptor = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Clone the request object
  let newReq = req.clone();

  // Response
  return next(newReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
          authService.authenticationHandler(false);
          localStorage.removeItem('isAuthenticated');
          router.navigate(['/login']);
      }
      return throwError(error);
    })
  );
};



