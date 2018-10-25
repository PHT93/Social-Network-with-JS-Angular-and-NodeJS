import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//Componentes
import { MainComponent } from './components/main/main.component';
import { AddComponent } from './components/add/add.component';
import { ReceivedComponent } from './components/received/received.component';
import { SendedComponent } from './components/sended/sended.component';

//Services
import { UserGuard } from '../services/user.guard';

const messagesRoutes : Routes = [
	{ 
		path: 'messages',
		component: MainComponent,
		children: [
			{ path: '', redirectTo: 'received', pathMatch: 'full' },
			{ path: 'send', component: AddComponent },
			{ path: 'received', component: ReceivedComponent },
			{ path: 'received/:page', component: ReceivedComponent },
			{ path: 'sended', component: SendedComponent },
			{ path: 'sended/:page', component: SendedComponent }
		],
		canActivate: [UserGuard]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(messagesRoutes)
	],
	exports: [
		RouterModule
	]
})
export class MessagesRoutingModule {}