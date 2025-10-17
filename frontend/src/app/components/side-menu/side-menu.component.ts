// Angular Core
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Angular Material
import { MatIconModule } from '@angular/material/icon';


@Component({
    selector: 'app-side-menu',
    templateUrl: './side-menu.component.html',
    styleUrls: ['./side-menu.component.css'],
    standalone: true,
    imports: [MatIconModule, CommonModule],
})
export class SideMenuComponent {
    @Input() isAdmin: boolean = false;

    constructor(private router: Router) { }

    navigateTo(path: string) {
        this.router.navigate([path]);
    }
}
