// Angular Core
import { Component, Input, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';

// Angular Material
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

// Application Components
import { AccessibilityToolbarComponent } from '../accessibility-toolbar/accessibility-toolbar.component';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { MessageComponent } from '../message/message.component';
import { SideMenuComponent } from '../side-menu/side-menu.component';

// Application Services
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [
        RouterOutlet,
        MatSidenavModule,
        MatToolbarModule,
        SideMenuComponent,
        HeaderComponent,
        FooterComponent,
        MessageComponent,
        AccessibilityToolbarComponent,
        NgIf
    ],
    templateUrl: './main-layout.component.html',
    styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
    @Input() userInfo: string = '';
    @Input() isAdmin: boolean = false;
    showSideMenu = false;

    constructor(private authService: AuthService, private router: Router) {
        const user = this.authService.getUserData();
        this.userInfo = user?.name + ' | ' + user.email + ' | ' + user?.role || 'Usuário';
        this.isAdmin = user?.role === 'ADMINISTRADOR';
    }

    ngOnInit(): void {
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: any) => {
                this.showSideMenu = !(event.urlAfterRedirects === '/admin');
            });
    }

}
