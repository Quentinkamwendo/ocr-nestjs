import { Component, ViewChild } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ImageUploadComponent } from './components/image-upload/image-upload.component';
import { MatDrawer, MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {MatListModule} from '@angular/material/list'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, MatIconModule, MatListModule, MatButtonModule, MatSidenavModule, MatToolbarModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
  // template: `
  //   <div class="app-container">
  //     <h1>Image Analyzer</h1>
  //     <app-image-upload></app-image-upload>
  //   </div>
  // `,
  // styles: [`
  //   .app-container {
  //     padding: 20px;
  //     max-width: 1200px;
  //     margin: 0 auto;
      
  //     h1 {
  //       text-align: center;
  //       margin-bottom: 30px;
  //       color: #333;
  //     }
  //   }
  // `]
})
export class AppComponent {
  title = 'Image Analyzer';
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;

  // @ViewChild('drawer') drawer!: MatDrawer; // Add this line to reference the drawer

  // onClick() {
  //   console.log('Menu button clicked');
  //   this.drawer.toggle();
  // }
  

}
