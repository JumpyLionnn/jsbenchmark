import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EditorComponent } from './editor/editor.component';
import { BenchmarkComponent } from './benchmark/benchmark.component';
import { BenchmarkResultsComponent } from './benchmark-results/benchmark-results.component';
import { DeleteDialogComponent } from './benchmark/delete-dialog/delete-dialog.component';
import { ErrorAlertComponent } from './error-alert/error-alert.component';
import { ProgressbarComponent } from './progressbar/progressbar.component';


import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { MonacoEditorModule } from 'ngx-monaco-editor';
import { OverlayContainer } from '@angular/cdk/overlay';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { Theme, ThemeService } from './theme/theme.service';

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    BenchmarkComponent,
    BenchmarkResultsComponent,
    DeleteDialogComponent,
    ErrorAlertComponent,
    ProgressbarComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    
    MonacoEditorModule.forRoot(),
    NgxChartsModule,

    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatExpansionModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    MatProgressBarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { 
  constructor(private theme: ThemeService, private overlayContainer: OverlayContainer) {
    this.theme.onChange.subscribe((current: Theme) => {
      this.changeTheme();
    });
    this.changeTheme();
  }

  private changeTheme(){
    if(this.theme.current === Theme.Light){
      this.overlayContainer.getContainerElement().classList.remove("dark-theme-mode");
    }
    else{
      this.overlayContainer.getContainerElement().classList.add("dark-theme-mode");
    }
  }
}
