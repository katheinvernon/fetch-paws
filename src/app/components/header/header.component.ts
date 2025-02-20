import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  constructor(private authService: AuthService, private router: Router,) {}

  logout() {
    const res = this.authService.logout().subscribe(res => {
      this.authService.authenticationHandler(false);
      localStorage.removeItem('isAuthenticated');
      this.router.navigate(['/login']);
    });
  }
}
