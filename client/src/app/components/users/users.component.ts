import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { Follow } from '../../models/follow';
import { UserService } from '../../services/user.service';
import { FollowService } from '../../services/follow.service';
import { Global } from '../../services/global';

@Component({
  selector: 'users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  providers: [UserService, FollowService]
})
export class UsersComponent implements OnInit {
	public title : string;
	public status : string;
	public identity;
	public token;
	public page;
	public next_page;
	public prev_page;
	public total;
	public pages;
	public users : User[];
	public url : string;
	public follow : Follow;
	public followThem;
	public followUserOver;

  constructor(
  	private _route : ActivatedRoute,
  	private _router : Router,
  	private _userService : UserService,
  	private _followService : FollowService
  ) {
  	this.title = "Gente";
  	this.identity = this._userService.getIdentity();
  	this.token = this._userService.getToken();
  	this.url = Global.url;
  }

  ngOnInit() {
  	//console.log("Componente de users arrancado");
  	this.actualPage();
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
  		
  		//Devolver listado de usuarios
  		this.getUsers(this.page);
  	});
  }

  getUsers(page) {
  	this._userService.getUsers(page).subscribe(
  		response => {
  			if(!response.Users) {
  				this.status = 'failed';
  			}else {
  				this.users = response.Users;
  				this.total = response.TotalUsers;
  				this.pages = response.TotalPages;
  				this.followThem = response.value.IFollowThem;
  				this.status = 'success';
  				//console.log(response);
  				if(page > this.pages) {
  					this._router.navigate(['/users/1']);
  				}
  			}
  		},
  		error => {
  			var errorMessage = <any>error;
  			console.log(errorMessage);

  			if(errorMessage != null) {
  				this.status = 'failed';
  			}
  		}
  	);
  }

  mouseEnter(userId) {
  	this.followUserOver = userId;
  }

  mouseLeave(userId) {
  	this.followUserOver = 0;
  }

  followUser(followed) {
  	this.follow = new Follow("", this.identity._id, followed);

  	this._followService.addFollow(this.token, this.follow).subscribe(
  		response => {
  			if(!response.follow) {
  				this.status = 'failed';
  			}else {
  				this.status = 'error';
  				this.followThem.push(followed);
  			}
  		},
  		error => {
  			var errorMessage = <any>error;
  			console.log(errorMessage);

  			if(errorMessage != null) {
  				this.status = 'failed';
  			}
  		}
  	);

  }

  unFollowUser(userId) {
  	this._followService.deleteFollow(this.token, userId).subscribe(
  		response => {
  			var search = this.followThem.indexOf(userId);
  			if(search != -1) {
  				this.followThem.splice(search, 1);
  			}
  		},
  		error => {
  			var errorMessage = <any>error;
  			console.log(errorMessage);

  			if(errorMessage != null) {
  				this.status = 'failed';
  			}
  		}
  	);
  }
}
