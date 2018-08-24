import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { FormComponent } from './pages/form/form.component';
import { TableComponent } from './pages/table/table.component';
import { FilterPipe } from './pipes/filter.pipe';
import { HighlightPipe } from './pipes/highlight.pipe';
import { BusinessService } from './services/business.service';
import { DisableControlDirective } from './disable-control.directive';
import { AuthService } from './services/auth.service';
import { CoordinatesService } from './services/coordinates.service';
import { AgmCoreModule } from '@agm/core';
import { AppDisableControlDirective } from './pages/form/disabled.directive';
import { GoogleplaceDirective } from './pages/form/google-place.directive';
import { SearchPipe } from './pages/home/search.pipe';
import { DraggableModule } from './draggable/draggable.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    FormComponent,
    TableComponent,
    FilterPipe,
    HighlightPipe,
    DisableControlDirective,
    AppDisableControlDirective,
    GoogleplaceDirective,
    SearchPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    FormsModule,
    DraggableModule
  ],
  providers: [BusinessService, AuthService, CoordinatesService, HomeComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
