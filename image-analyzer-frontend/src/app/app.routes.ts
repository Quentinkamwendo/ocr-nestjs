import { Routes } from '@angular/router';
// import { ImageUploadComponent } from './components/image-upload/image-upload.component';
import { ProcessedComponent } from './components/processed/processed.component';

const imageUploadComponent = () => import('./components/image-upload/image-upload.module').then(m => m.ImageUploadModule);

export const routes: Routes = [
    {path: 'image', loadChildren: imageUploadComponent},
    {path: 'processed', component: ProcessedComponent}
];
