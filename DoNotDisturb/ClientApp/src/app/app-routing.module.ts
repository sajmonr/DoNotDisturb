import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {DashboardComponent as OutsideDashboardComponent} from './outside/dashboard/dashboard.component';
import {SettingsComponent} from './settings/settings.component';
import {InsideComponent} from './inside/inside.component';
import {SetupComponent} from './setup/setup.component';

const routes: Routes = [
  {path: '', redirectTo: 'outside', pathMatch: 'full'},
  {path: 'inside', component: InsideComponent},
  {path: 'inside/:mode', component: InsideComponent},
  {path: 'outside', children: [
      {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
      {path: 'dashboard', component: OutsideDashboardComponent},
      {path: 'dashboard/:tomorrow', component: OutsideDashboardComponent}
    ]},
  {path: 'setup', component: SetupComponent},
  {path: 'settings', component: SettingsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
