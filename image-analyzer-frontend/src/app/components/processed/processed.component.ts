import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import { ImageService } from '../../services/image.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-processed',
  standalone: true,
  imports: [MatGridListModule, MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule, CommonModule, RouterModule, MatListModule],
  templateUrl: './processed.component.html',
  styleUrl: './processed.component.scss'
})
export class ProcessedComponent {
  processedFiles: any[] = [];

  constructor(private imageService: ImageService, private snackBar: MatSnackBar) {
    this.imageService.getAllImages().subscribe((images: any) => {
      this.processedFiles = images;
    });
    
  }

  delete(id: string) {
    this.imageService.deleteImage(id).subscribe((response: any) => {
      this.processedFiles = this.processedFiles.filter((file) => file.id !== id);
      this.snackBar.open(response.message, 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'});
    });
  }

}
