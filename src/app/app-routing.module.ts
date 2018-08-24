import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { FormComponent } from './pages/form/form.component';
import { TableComponent } from './pages/table/table.component';

const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: 'home', component: HomeComponent, children:
      [
        {path: '', redirectTo: 'table', pathMatch: 'full'},
        {path: 'form', component: FormComponent},
        {path: 'table', component: TableComponent}
      ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [ RouterModule ]
})

export class AppRoutingModule { }
