import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {DashboardComponent as OutsideDashboardComponent} from './outside/dashboard/dashboard.component';
import {SettingsComponent} from './settings/settings.component';
import {InsideComponent} from './inside/inside.component';
import {SetupComponent} from './setup/setup.component';
import {OutsideComponent} from "./outside/outside.component";
import {LocationGuard} from "./shared/guards/location.guard";

const routes: Routes = [
  {path: '', redirectTo: 'outside', pathMatch: 'full'},
  {path: 'inside', component: InsideComponent, canActivate: [LocationGuard]},
  {path: 'outside', component: OutsideComponent, canActivate: [LocationGuard], children: [
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
