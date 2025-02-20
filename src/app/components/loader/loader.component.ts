import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent {


  @Input() options: {inline?: boolean, overlay?: boolean, affectModal?: boolean } = { inline: false, overlay: false, affectModal: false };
  
}
