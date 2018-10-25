import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { Follow } from '../../models/follow';
import { UserService } from '../../services/user.service';
import { FollowService } from '../../services/follow.service';
import { Global } from '../../services/global';

@Component({
  selector: 'followed',
  templateUrl: './followed.component.html',
  styleUrls: ['./followed.component.css'],
  providers: [UserService, FollowService]
})
export class FollowedComponent implements OnInit {
	public title : string;
	public status : string;
	public identity;
	public token;
	public page;
	public next_page;
	public prev_page;
	public total;
	public pages;
  	public user : User;
	public users : User[];
	public url : string;
	public follow : Follow;
	public followThem;
	public followUserOver;
	public followed;
  	public userPageId;

  constructor(
  	private _route : ActivatedRoute,
  	private _router : Router,
  	private _userService : UserService,
  	private _followService : FollowService
  ) {
  	this.title = "Seguidores de ";
  	this.identity = this._userService.getIdentity();
  	this.token = this._userService.getToken();
  	this.url = Global.url;
  }

  ngOnInit() {
  	//console.log("Componente de followed arrancado");
  	this.actualPage();
  }

  actualPage() {
  	this._route.params.subscribe(params => {
  		let userId = params['id'];
  		let page = +params['page'];
      this.userPageId = userId;

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
      this.getUser(userId, this.page);
  	});
  }

  getFollows(userId, page) {
  	this._followService.getFollowed(this.token, userId, page).subscribe(
  		response => {
  			if(!response.MyFollows) {
  				this.status = 'failed';
  			}else {
          		//console.log(response);
  				this.followed = response.MyFollows;
  				//console.log(followed);
  				this.total = response.TotalMyFollows;
  				this.pages = response.TotalMyFollowsPages;
  				this.followThem = response.value.followed;
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

  getUser(userId, page) {
    this._userService.getUser(userId).subscribe(
      response => {
        if(response.user) {
          this.user = response.user;
          this.getFollows(userId, page);
        }else {
          this._router.navigate(['/home']);
        }
      },
      err => {
        var errorMessage = <any>err;
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

