import { Component } from '@angular/core';
import {DarkModeToggleComponent} from "../dark-mode-toggle/dark-mode-toggle.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    DarkModeToggleComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
