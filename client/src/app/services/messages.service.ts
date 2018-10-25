import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Global } from './global';
import { Message } from '../models/message';

@Injectable()
export class MessagesService {
	public url : string;

	constructor(
		private _http : HttpClient
	) {
		this.url = Global.url;
	}

	addMessage(token, message : Message) : Observable<any> {
		let params = JSON.stringify(message);
		let headers = new HttpHeaders().set('Content-Type', 'application/json')
									   .set('Authorization', token);

		return this._http.post(this.url + 'send-message', params, { headers: headers });
	}

	getMyMessages(token, page = 1) : Observable<any> {
		let headers = new HttpHeaders().set('Content-Type', 'application/json')
									   .set('Authorization', token);

		return this._http.get(this.url + 'my-messages/' + page, { headers: headers });
	}

	getEmittedMessages(token, page = 1) : Observable<any> {
		let headers = new HttpHeaders().set('Content-Type', 'application/json')
									   .set('Authorization', token);

		return this._http.get(this.url + 'my-emitted-messages/' + page, { headers: headers });
	}
}