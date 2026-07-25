import { Routes } from '@angular/router';
import { LoginComponent } from "./features/auth/login/login.component";
import { HomeComponent } from "./shared/components/home/home.component";
import { ServicesComponent } from "./features/services/services/services.component";
import { ContactComponent } from "./features/contact/contact/contact.component";
import { AdminAvailabilityComponent } from './features/reservation/admin-availability/admin-availability.component';
import { MyReservationsComponent } from "./features/reservation/my-reservations/my-reservations.component";
import { AdminReservationsComponent } from "./features/reservation/admin-reservations/admin-reservations.component";
import { MakeReservationComponent } from "./features/reservation/make-reservation/make-reservation.component";
import { AdminLayoutComponent } from "./features/admin/admin-layout/admin-layout.component";
import { ClientChatComponent } from "./features/chat/client-chat/client-chat.component";
import { AdminChatComponent } from "./features/chat/admin-chat/admin-chat.component";
import { adminGuard } from "./core/guards/admin.guard";
import { authGuard } from "./core/guards/auth.guard";

export const routes: Routes = [

  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'contact', component: ContactComponent },

  // Booking
  { path: 'book', component: MakeReservationComponent },
  { path: 'make-reservation', redirectTo: 'book' },
  { path: 'my-reservations', component: MyReservationsComponent },
  { path: 'reservations', redirectTo: 'my-reservations' },

  // Client space
  { path: 'chat', component: ClientChatComponent, canActivate: [authGuard] },

  // Admin area (guarded)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'reservations', pathMatch: 'full' },
      { path: 'reservations', component: AdminReservationsComponent },
      { path: 'availability', component: AdminAvailabilityComponent },
      { path: 'chat', component: AdminChatComponent },
    ]
  },
  { path: 'admin-reservations', redirectTo: 'admin/reservations' },

  { path: '**', redirectTo: '' }

];
