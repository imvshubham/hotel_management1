import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['role'] as UserRole;
  const user = authService.currentUser();

  if (user && user.role === expectedRole) {
    return true;
  }

  // Redirect to dashboard if not authorized
  router.navigate(['/dashboard']);
  return false;
};
