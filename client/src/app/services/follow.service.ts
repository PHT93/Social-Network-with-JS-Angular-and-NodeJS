import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Global } from './global';
import { Follow } from '../models/follow';

@Injectable()
export class FollowService {
	public url : string;

	constructor(
		private _http : HttpClient
	) {
		this.url = Global.url;
	}

	addFollow(token, follow) : Observable<any> {
		let params = JSON.stringify(follow);
		let headers = new HttpHeaders().set('Content-Type', 'application/json')
									   .set('Authorization', token);
		return this._http.post(this.url + 'follow', params, { headers: headers });
	}

	deleteFollow(token, userId) : Observable<any> {
		let headers = new HttpHeaders().set('Content-Type', 'application/json')
									   .set('Authorization', token);
		return this._http.delete(this.url + 'unfollow/' + userId, { headers: headers });
	}

	getFollowing(token, userId = null, page = 1) : Observable<any> {
		let headers = new HttpHeaders().set('Content-Type', 'application/json')
									   .set('Authorization', token);

		var urlFollowing = this.url + 'my-follows';
		if(userId != null) {
			urlFollowing = this.url + 'my-follows/' + userId + '/' + page;
		}

		return this._http.get(urlFollowing, { headers: headers });
	}

	getFollowed(token, userId = null, page = 1) : Observable<any> {
		let headers = new HttpHeaders().set('Content-Type', 'application/json')
									   .set('Authorization', token);

		var urlFollowing = this.url + 'my-followers';
		if(userId != null) {
			urlFollowing = this.url + 'my-followers/' + userId + '/' + page;
		}

		return this._http.get(urlFollowing, { headers: headers });
	}

	getMyFollows(token) : Observable<any> {
		let headers = new HttpHeaders().set('Content-Type', 'application/json')
									   .set('Authorization', token);

		return this._http.get(this.url + 'get-my-follows/true', { headers: headers });
	}
}