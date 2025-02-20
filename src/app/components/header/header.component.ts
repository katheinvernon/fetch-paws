import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  constructor(private authService: AuthService, private router: Router,) {}

  async logout() {
    try {
      await this.authService.logout();
      this.authService.authenticationHandler(false);
      localStorage.removeItem('isAuthenticated');
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('err', error);
    }
  }
}
