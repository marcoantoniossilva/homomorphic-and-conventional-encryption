import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accessibility-toolbar',
  templateUrl: './accessibility-toolbar.component.html',
  imports: [CommonModule],
  styleUrls: ['./accessibility-toolbar.component.css']
})
export class AccessibilityToolbarComponent {
  expanded = false;
  fontSize = 100;
  contrastEnabled = false;

  togglePanel(): void {
    this.expanded = !this.expanded;
  }

  increaseFont(): void {
    if (this.fontSize < 150) {
      this.fontSize += 10;
      this.applyFontSize();
    }
  }

  decreaseFont(): void {
    if (this.fontSize > 80) {
      this.fontSize -= 10;
      this.applyFontSize();
    }
  }

  applyFontSize(): void {
    document.documentElement.style.fontSize = `${this.fontSize}%`;
  }

  toggleContrast(): void {
    this.contrastEnabled = !this.contrastEnabled;
    document.body.classList.toggle('high-contrast', this.contrastEnabled);
  }

  reset(): void {
    this.fontSize = 100;
    this.applyFontSize();
    this.contrastEnabled = false;
    document.body.classList.remove('high-contrast');
  }
}
