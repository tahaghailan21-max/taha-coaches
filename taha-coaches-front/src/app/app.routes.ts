import { Routes } from '@angular/router';
import { LoginComponent } from "./features/auth/login/login.component";
import { HomeComponent } from "./shared/components/home/home.component";
import { ServicesComponent } from "./features/services/services/services.component";
import { ContactComponent } from "./features/contact/contact/contact.component";
import { BookingComponent } from './features/reservation/booking/booking.component';
import { AdminAvailabilityComponent } from './features/reservation/admin-availability/admin-availability.component';
import { MyReservationsComponent } from './features/reservation/my-reservation/my-reservation.component';

export const routes: Routes = [

  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'book', component: BookingComponent },
  { path: 'admin/availability', component: AdminAvailabilityComponent },
  { path: 'reservations', component: MyReservationsComponent},

  // Add other routes if needed
  { path: '**', redirectTo: '' } // wildcard route

];
