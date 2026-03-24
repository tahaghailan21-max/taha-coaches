import { Routes } from '@angular/router';
import {LoginComponent} from "./features/auth/login/login.component";
import {HomeComponent} from "./shared/components/home/home.component";
import {ServicesComponent} from "./features/services/services/services.component";
import {ContactComponent} from "./features/contact/contact/contact.component";

export const routes: Routes = [

  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'contact', component: ContactComponent },
  // Add other routes if needed
  { path: '**', redirectTo: '' } // wildcard route

];
