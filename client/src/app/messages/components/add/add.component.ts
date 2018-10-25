import { Component, OnInit, DoCheck } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Message } from '../../../models/message';
import { Follow } from '../../../models/follow';
import { Global } from '../../../services/global';
import { UserService } from '../../../services/user.service';
import { FollowService } from '../../../services/follow.service';
import { MessagesService } from '../../../services/messages.service';

@Component({
	selector: 'add',
	templateUrl: './add.component.html',
	providers: [UserService, FollowService, MessagesService]
})
export class AddComponent implements OnInit {
	public title : string;
	public message : Message;
	public identity;
	public token;
	public url : string;
	public status : string;
	public follows;

	constructor(
		private _route : ActivatedRoute,
		private _router : Router,
		private _userService : UserService,
		private _followService : FollowService,
		private _messagesService : MessagesService
	) {
		this.title = "Enviar mensajes";
		this.identity = this._userService.getIdentity();
		this.token = this._userService.getToken();
		this.url = Global.url;
		this.message = new Message("", "", "", "", this.identity._id, "");
	}

	ngOnInit() {
		//console.log("Component add cargado");
		this.getMyFollows();
	}

	getMyFollows() {
		this._followService.getMyFollows(this.token).subscribe(
			response => {
				this.follows = response.follows;
			},
			err => {
				console.log(<any>err);
			}
		);
	}

	onSubmit(form) {
		//console.log(this.message);
		this._messagesService.addMessage(this.token, this.message).subscribe(
			response => {
				if(response.messageStored) {
					this.status = 'success';
					form.reset();
				}
			},
			err => {
				this.status = 'failed';
				console.log(<any>err);
			}
		);
	}
}