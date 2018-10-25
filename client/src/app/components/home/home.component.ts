import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [UserService]
})
export class HomeComponent implements OnInit {
	public title : string;
  public identity;

  constructor(
    private _userService : UserService
  ) { 
  	this.title ="Bienvenido a NGSocial";
    this.identity = this._userService.getIdentity();
  }

  ngOnInit() {
  	//console.log("Componente Home cargado");
  }

}
