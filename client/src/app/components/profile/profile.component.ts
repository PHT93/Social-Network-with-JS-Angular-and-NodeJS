import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { Follow } from '../../models/follow';
import { Global } from '../../services/global';
import { UserService } from '../../services/user.service';
import { FollowService } from '../../services/follow.service';

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: [UserService, FollowService]
})
export class ProfileComponent implements OnInit {
	public title : string;
	public url : string;
	public status : string;
	public user : User;
	public followed;
	public following;
	public identity;
	public token;
	public stats;
	public followUserOver;

  constructor(
  	private _route : ActivatedRoute,
  	private _router : Router,
  	private _userService : UserService,
  	private _followService : FollowService
  ) { 
  	this.title = 'Perfil';
  	this.url = Global.url;
  	this.identity = this._userService.getIdentity();
  	this.token = this._userService.getToken();
    //this.stats = this._userService.getStats();
  	this.following = false;
  	this.followed = false;
  }

  ngOnInit() {
  	//console.log("Componente de perfil arrancado");
  	this.loadPage();
  }

  loadPage() {
  	this._route.params.subscribe(params => {
  		let id = params['id'];
  		//console.log(id);
  		this.getUser(id);
  		this.getCounters(id);
  	});
  }

  getUser(userId) {
  	this._userService.getUser(userId).subscribe(
  		response => {
  			if(response.user) {
  				//console.log(response);
  				this.user = response.user;

  				if(response.value.ImFollowing && response.value.ImFollowing._id) {
  					this.following = true;
  				}else {
  					this.following = false;
  				}

  				if(response.value.FollowingMe && response.value.FollowingMe._id) {
  					this.followed = true;
  				}else {
  					this.followed = false;
  				}

  			}else {
  				this.status = 'failed';
  			}
  		},
  		err => {
  			var errorMessage = <any>err;
  			console.log(errorMessage);

  			if(errorMessage != null) {
  				this.status = 'failed';
  			}
  			this._router.navigate(['/profile', this.identity._id]);
  		}
  	);
  }

  getCounters(userId) {
  	this._userService.getCounters(userId).subscribe(
  		response => {
        this.stats = response;
  		},
  		error => {
  			var errorMessage = <any>error;
  			console.log(errorMessage);
  		}
  	);
  }

  followUser(userId) {
  	var follow = new Follow('', this.identity._id, userId);

  	this._followService.addFollow(this.token, follow).subscribe(
  		response => {
  			//console.log(response);
  			this.following = true;
  		},
  		err => {
  			console.log(<any>err);
  		}
  	);
  }

  unfollowUser(followed) {
  	this._followService.deleteFollow(this.token, followed).subscribe(
  		response => {
  			//console.log(response);
  			this.following = false;
  		},
  		err => {
  			console.log(<any>err);
  		}
  	);
  }

  mouseEnter(userId) {
  	this.followUserOver = userId;
  }

  mouseLeave() {
  	this.followUserOver = 0;
  }

}
