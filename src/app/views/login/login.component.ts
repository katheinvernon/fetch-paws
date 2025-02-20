import { Component, inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { LoaderComponent } from '../../components/loader/loader.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import * as Cookies from 'js-cookie';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule, MatButtonModule, LoaderComponent, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent {
  loginForm: FormGroup;
  isLoading = new BehaviorSubject<boolean>(false);

  private _snackBar = inject(MatSnackBar);

  constructor(private router: Router, private authService: AuthService) {
    this.loginForm = new FormGroup({
      email: new FormControl('sdasda@gmail.com', [
        Validators.required,
        Validators.minLength(4),
        Validators.email]),
      name: new FormControl('dsadasdad', [
        Validators.required]),
    })
  }

  getErrorMessage(key: string) {
    return this.loginForm.controls[key].hasError('email') ? 'Invalid email' : key === 'email' ?
      'Write your email' : 'Write your full name';
  }

  onSubmit(): void {
    this.login();
  }

  login() {
    if (this.loginForm.valid) {
      try {
        this.isLoading.next(true);
        this.authService.login(this.loginForm.value).subscribe(res => {
          const cookie = res.headers.getAll('Set-Cookie');
          this.authService.authenticationHandler(true);
          localStorage.setItem('isAuthenticated', 'true');
          this.router.navigate(['/user/dogs-list']);
        });
      } catch (err: null | any) {
        console.error(err);
        this.isLoading.next(false);
        this.openSnackBar('Oops, something goes wrong, try again!', 'Ok');
      }
    } else {
      this.openSnackBar('Invalid data, please check your email and name', 'Ok')
    }
  }

  openSnackBar(message: string, action?: string) {
    this._snackBar.open(message, action);
  }
}
