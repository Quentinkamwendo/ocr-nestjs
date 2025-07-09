import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FileUploader } from 'ng2-file-upload';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'ng2-file-upload';
import { first, firstValueFrom } from 'rxjs';
import { ImageService } from '../../services/image.service';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { ActivatedRoute } from '@angular/router';

interface UploadResponse {
  status: 'accepted' | 'rejected';
  data: {
    image: {
      id: string;
      filename: string;
      path: string;
      extractedText: string;
      status: string;
      createdAt: string;
    };
    extractedText: string;
  };
}

@Component({
  selector: 'app-image-upload',
  // imports: [
    
  // ],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss'],
  // standalone: true,
})
export class ImageUploadComponent implements OnInit, OnDestroy {
  uploader: FileUploader;
  uploadedImage: any;
  uploadForm: FormGroup;
  isLoading: boolean = false;
  keywordsArray: string[] = [];
  id?: string;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private imageService: ImageService,
    private route: ActivatedRoute
  ) {
    this.uploader = new FileUploader({
      url: '/api/images/upload',
      itemAlias: 'image',
      removeAfterUpload: true,
      autoUpload: false,
    });

    this.uploadForm = this.fb.group({
      keywords: [''],
    });

    this.uploader.onAfterAddingFile = (fileItem) => {
      // fileItem.upload();
      this.uploadFile(fileItem._file);
    };
  }

  onSubmit() {
    const keywords = this.uploadForm.get('keywords')?.value || '';
    this.keywordsArray = keywords
      .split(',')
      .map((k: string) => k.trim())
      .filter(Boolean);
    console.log('keywordsArray: ', this.keywordsArray);

    this.uploadForm.patchValue({ keywords: this.keywordsArray.join(',') });
  }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];

    if (this.id) {
      this.imageService.getImage(this.id).subscribe({
        next: (response: any) => {
          this.uploadedImage = response;
          this.keywordsArray = response.keywords.split(',');
          this.uploadForm.patchValue({ keywords: this.keywordsArray.join(',') });
        },
        error: (error) => {
          this.showNotification('Failed to fetch image', 'error');
        },
      });
      
    }
    this.uploader.onBeforeUploadItem = (item) => {
      item.withCredentials = false;
      const keywords = this.uploadForm.get('keywords')?.value || '';
      const keywordsArray = keywords
        .split(',')
        .map((k: string) => k.trim())
        .filter(Boolean);

      const formData = new FormData();
      formData.append('image', item._file);
      formData.append('keywords', JSON.stringify(keywordsArray)); // Send as JSON string array

      item.formData = formData;
    };

    this.uploader.onSuccessItem = (item, response) => {
      try {
        const result: UploadResponse = JSON.parse(response);
        this.uploadedImage = {
          ...result.data.image,
          extractedText: result.data.extractedText,
        };
        console.log('uploadedImage: ', this.uploadedImage);
        

        this.showNotification(
          `Image ${result.status === 'accepted' ? 'accepted' : 'rejected'}`,
          'success'
        );
      } catch (error) {
        this.showNotification('Error processing response', 'error');
      }
      this.isLoading = false;
    };

    this.uploader.onErrorItem = (item, response, status, headers) => {
      this.showNotification('Failed to upload image', 'error');
      this.isLoading = false;
    };

    this.uploader.onProgressItem = (item, progress) => {
      if (progress === 100) {
        this.showNotification('Processing image...', 'info');
      }
    };
  }

  public removeKeyword(keyword: string): void {
    const index = this.keywordsArray.indexOf(keyword);
    if (index >= 0) {
      this.keywordsArray.splice(index, 1);
    }
  }

  private uploadFile(file: File) {
    if (this.id) {
      this.imageService.updateImage(this.id, file, this.keywordsArray.join(',')).subscribe({
        next: (response: any) => {
          this.uploadedImage = response;
          this.showNotification('Image updated successfully', 'success');
          this.uploadForm.reset();
        },
        error: (error) => {
          this.showNotification('Failed to update image', 'error');
        },
      });
      
    } else {
      this.imageService.uploadFile(file, this.keywordsArray.join(',')).subscribe({
        next: (response: any) => {
          this.uploadedImage = {
            ...response.data.image,
            extractedText: response.data.extractedText,
          };
          this.showNotification('Image uploaded successfully', 'success');
          this.uploadForm.reset();
        },
        error: (error) => {
          this.showNotification('Failed to upload image', 'error');
        },
      });
    }
  }

  // onFileSelected(event: any) {
  //   if (event.target.files.length > 0) {
  //     const file = event.target.files[0];
  //     this.uploader.clearQueue();
  //     this.uploader.addToQueue([file]);
  //   }
  // }

  // analyseFile(item: any) {
  //   const keywords = this.uploadForm.get('keywords')?.value;
  //   if (!keywords?.trim()) {
  //     this.showNotification('Please enter keywords first', 'warning');
  //     return;
  //   }

  //   this.isLoading = true;
  //   item.upload();
  // }

  async exportToPdf() {
    try {
      const response = await firstValueFrom(
        this.http.get(`/api/images/${this.uploadedImage.id}/export/pdf`, {
          responseType: 'blob',
        })
      );

      this.downloadFile(response, 'application/pdf', 'analysis-report.pdf');
    } catch (error) {
      this.showNotification('Failed to export PDF', 'error');
    }
  }

  async exportToWord() {
    try {
      const response = await firstValueFrom(
        this.http.get(`/api/images/${this.uploadedImage.id}/export/docx`, {
          responseType: 'blob',
        })
      );

      this.downloadFile(
        response,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'analysis-report.docx'
      );
    } catch (error) {
      this.showNotification('Failed to export Word document', 'error');
    }
  }

  private downloadFile(data: any, type: string, filename: string) {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private showNotification(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info'
  ) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [`notification-${type}`],
    });
  }

  async deleteImage(id: string) {
    this.imageService.deleteImage(id).subscribe(() => {
      this.showNotification('Image deleted successfully', 'success');
    });
  }

  ngOnDestroy() {
    if (this.uploader) {
      this.uploader.clearQueue();
    }
  }
}
