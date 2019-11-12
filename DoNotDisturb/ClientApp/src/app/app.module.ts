import { BrowserModule } from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent as OutsideDashboardComponent } from './outside/dashboard/dashboard.component';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import { SettingsComponent } from './settings/settings.component';
import {SettingsService} from './shared/services/settings.service';
import { SpinnerComponent } from './spinner/spinner.component';
import { InsideComponent } from './inside/inside.component';
import { OutsideComponent } from './outside/outside.component';
import {DashboardComponent as InsideDashboardComponent} from './inside/dashboard/dashboard.component'
import {CalendarService} from './shared/services/calendar.service';
import {MessageService} from './shared/services/message.service';
import {MessageComponent} from './shared/components/message/message.component';
import {RoomService} from './shared/services/room.service';
import {TimePipe} from './shared/pipes/time.pipe';
import { WelcomeComponent } from './inside/welcome/welcome.component';
import {TimingService} from './shared/services/timing.service';
import {NgCircleProgressModule} from 'ng-circle-progress';
import { TimeAlertComponent } from './inside/dashboard/time-alert/time-alert.component';
import {SetupComponent} from './setup/setup.component';
import {FormsModule} from '@angular/forms';
import {GlobalWelcomeComponent} from "./inside/welcome/global-welcome/global-welcome.component";
import {EmptyWelcomeComponent} from "./inside/welcome/empty-welcome/empty-welcome.component";
import {PersonalWelcomeComponent} from "./inside/welcome/personal-welcome/personal-welcome.component";
import {ModalService} from "./shared/services/modal.service";
import {ToastService} from "./shared/services/toast.service";
import {ScheduleMeetingsComponent} from "./shared/components/schedule/schedule-meetings/schedule-meetings.component";
import {ScheduleComponent} from "./shared/components/schedule/schedule.component";

@NgModule({
  declarations: [
    AppComponent,
    MessageComponent,
    OutsideDashboardComponent,
    InsideDashboardComponent,
    SettingsComponent,
    SpinnerComponent,
    InsideComponent,
    OutsideComponent,
    ScheduleMeetingsComponent,
    ScheduleComponent,
    TimePipe,
    WelcomeComponent,
    TimeAlertComponent,
    SetupComponent,
    GlobalWelcomeComponent,
    EmptyWelcomeComponent,
    PersonalWelcomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgCircleProgressModule.forRoot({
      'radius': 60,
      'maxPercent': 100,
      'clockwise': false,
      'animation': false
    }),
    FormsModule
  ],
  providers: [HttpClient, SettingsService, CalendarService, MessageService, ModalService, ToastService, RoomService, TimingService],
  bootstrap: [AppComponent]
})
export class AppModule { }
