import { Component } from '@angular/core';
import {DarkModeToggleComponent} from "../dark-mode-toggle/dark-mode-toggle.component";
import {RouterModule} from "@angular/router";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    DarkModeToggleComponent,
    RouterModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  isOpen = false; // mobile menu toggle

}
