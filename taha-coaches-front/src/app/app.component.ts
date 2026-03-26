import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {HomeComponent} from "./shared/components/home/home.component";
import {NavbarComponent} from "./shared/components/navbar/navbar.component";
import {FooterComponent} from "./shared/components/footer/footer.component";
import {LanguageService} from "./core/services/language/language.service";
import {AuthService} from "./core/services/auth/auth.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'taha-coaches-front';

  constructor(
    private languageService: LanguageService,
    private authService: AuthService
  ) {

  }


  ngOnInit() {
    this.languageService.init();
    this.authService.getCurrentUser();
  }

}
