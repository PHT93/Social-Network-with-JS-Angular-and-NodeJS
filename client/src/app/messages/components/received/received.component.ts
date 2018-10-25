import { Component, OnInit, DoCheck } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Message } from '../../../models/message';
import { Follow } from '../../../models/follow';
import { Global } from '../../../services/global';
import { UserService } from '../../../services/user.service';
import { FollowService } from '../../../services/follow.service';
import { MessagesService } from '../../../services/messages.service';

@Component({
	selector: 'received',
	templateUrl: './received.component.html',
	providers: [UserService, FollowService, MessagesService]
})
export class ReceivedComponent implements OnInit {
	public title : string;
	public message : Message;
	public identity;
	public token;
	public url : string;
	public status : string;
	public messages : Message[] = [];
	public page;
	public next_page;
	public prev_page;
	public total;
	public pages;

	constructor(
		private _route : ActivatedRoute,
		private _router : Router,
		private _userService : UserService,
		private _followService : FollowService,
		private _messagesService : MessagesService) 
	{
		this.identity = this._userService.getIdentity();
		this.title = "Mensajes recibidos de " + this.identity.name;
		this.token = this._userService.getToken();
		this.url = Global.url;
		this.message = new Message("", "", "", "", this.identity._id, "");
	}

	ngOnInit() {
		//console.log("Component sended cargado");
		this.actualPage();
	}

	getMessages(token, page) {
		this._messagesService.getMyMessages(token, page).subscribe(
			response => {
				//console.log(response);
				if(response.MyMessages) {
					this.messages = response.MyMessages;
					this.total = response.total;
					this.pages = response.pages;
					//console.log(this.messages);
				}
			},
			err => {
				console.log(<any>err);
			}
		);
	}

	actualPage() {
  	this._route.params.subscribe(params => {
  		let page = +params['page'];

  		if(!page) {
  			page = 1;
  		}

  		this.page = page;
		this.next_page = page + 1;
		this.prev_page = page - 1;

		if(this.prev_page <= 0) {
			this.prev_page = 1;
		}
  		
  		//Devolver listado de mensajes
      	this.getMessages(this.token, this.page);
  	});
  }
}