import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [UserService]
})
export class LoginComponent implements OnInit {
	public title : string;
  public user : User;
  public status : string;
  public identity;
  public token;

  constructor(
    private _route : ActivatedRoute,
    private _router : Router,
    private _userService : UserService
  ) { 
  	this.title = "Identifícate";
    this.user = new User("", "", "", "", "", "", "ROLE_USER", "", "");
  }

  ngOnInit() {
  	//console.log("Componente de login cargado");
  }

  onSubmit() {
    //console.log(this.user);
    this._userService.signUp(this.user).subscribe(
    response => {
      this.identity = response.loginUser;

      if(!this.identity || !this.identity._id) {
        this.status = 'failed';
      }else {
        
        //PERSISTIR DATOS DEL USUARIO
        localStorage.setItem('identity', JSON.stringify(this.identity));

        //CONSEGUIR EL TOKEN
        this.getToken();
      }
    },
    error => {
      var errorMessage = <any>error;
      console.log(errorMessage);

      if(errorMessage) {
        this.status = 'failed';
      }
    });
  }

  getToken(){
    this._userService.signUp(this.user, 'true').subscribe(
      response => {
        //console.log(response);
        this.token = response.token;
        
        if(this.token.length <= 0) {
          this.status = 'failed';
        }else {
          this.status = 'success';

          //PERSISTIR TOKEN DEL USUARIO
          localStorage.setItem('token', JSON.stringify(this.token));

          //CONSEGUIR ESTADÍSTICAS
          this.getCounters();
        }
      },
      error => {
        var errorMessage = <any>error;
        console.log(errorMessage);

        if(errorMessage) {
          this.status = 'failed';
        }
      });
    }

    getCounters() {
      this._userService.getCounters().subscribe(
        response => {
          localStorage.setItem('stats', JSON.stringify(response));
          this.status = 'success';
          this._router.navigate(['/']);
        },
        error => {
          console.log(error);
        }
      );
    }

}