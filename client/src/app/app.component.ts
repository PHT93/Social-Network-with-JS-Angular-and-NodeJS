import { Component, OnInit, DoCheck } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserService } from './services/user.service';
import { Global } from './services/global';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [UserService]
})
export class AppComponent implements OnInit, DoCheck{
  public title;
  public identity;
  public token;
  public url : string;

  constructor(
    private _route : ActivatedRoute,
    private _router : Router,
  	private _userService : UserService
  ) {
  	this.title = "NGSOCIAL";
    this.url = Global.url;
  }

  ngOnInit() {
  	this.identity = this._userService.getIdentity();
  }

  //Cada vez que suceda un cambio en el componente
  ngDoCheck() {
  	this.identity = this._userService.getIdentity();
  }

  logout() {
    localStorage.clear();
    this._router.navigate(['/login']);
  }

}
