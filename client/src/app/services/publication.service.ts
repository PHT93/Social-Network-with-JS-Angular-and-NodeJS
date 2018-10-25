import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Global } from './global';
import { Publication } from '../models/publication';

@Injectable()
export class PublicationService {
	public url : string;

	constructor(
		private _http : HttpClient
	) {
		this.url = Global.url;
	}

	addPublication(token, publication : Publication) : Observable<any> {
		let params = JSON.stringify(publication);
		let headers = new HttpHeaders().set('Content-Type', 'application/json')
									   .set('Authorization', token);

		return this._http.post(this.url + 'publication', params, { headers: headers });
	}

	getPublicationsIFollow(token, page = 1) : Observable<any> {
		let headers = new HttpHeaders().set('Content-Type', 'application/json')
									   .set('Authorization', token);
		return this._http.get(this.url + 'publications/' + page, { headers: headers });
	}

	getPublicationsUser(token, userId, page = 1) : Observable<any> {
		let headers = new HttpHeaders().set('Content-Type', 'application/json')
									   .set('Authorization', token);

		return this._http.get(this.url + 'publications-user/' + userId + '/' + page, { headers: headers });
	}

	deletePublication(token, publicationId) : Observable<any> {
		let headers = new HttpHeaders().set('Content-Type', 'application/json')
									   .set('Authorization', token);
		return this._http.delete(this.url + 'remove-publication/' + publicationId, { headers: headers });
	}
}