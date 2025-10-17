// Angular Core
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Application Services
import { MessageService } from '../../services/message.service';


@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  imports: [CommonModule],
  styleUrls: ['./message.component.css'],
  standalone: true
})
export class MessageComponent implements OnInit {
  message: string | null = null;
  type: 'success' | 'error' | 'info' | 'warning' = 'info';
  visible = false;

  constructor(private messageService: MessageService) { }

  ngOnInit() {
    this.messageService.message$.subscribe((msg) => {
      this.message = msg.text;
      this.type = msg.type;
      this.visible = true;

      if (msg.type === 'success' || msg.type === 'info') {
        setTimeout(() => this.close(), 4000);
      }
    });
  }

  close() {
    this.visible = false;
    this.message = null;
  }
}
