import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private http: HttpClient) { }

  uploadFile(file: File, keywords: string) {
    const keywordsArray = keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('keywords', JSON.stringify(keywordsArray));
    return this.http.post('/api/images/upload', formData);
  }

  updateImage(id: string, file: File, keywords: string) {
    const keywordsArray = keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('keywords', JSON.stringify(keywordsArray));
    return this.http.patch(`/api/images/${id}`, formData);
  }
  deleteImage(id: string) {
    return this.http.delete(`/api/images/${id}`);
  }

  getAllImages() {
    return this.http.get('/api/images');
  }

  getImage(id: string) {
    return this.http.get(`/api/images/${id}`);
  }
}
