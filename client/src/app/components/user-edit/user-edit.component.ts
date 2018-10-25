import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { UploadService } from '../../services/upload.service';
import { Global } from '../../services/global';

@Component({
  selector: 'user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css'],
  providers: [UserService, UploadService]
})
export class UserEditComponent implements OnInit {
	public title : string;
	public user : User;
	public identity;
	public token;
	public status : string;
  public filesToUpload : Array<File> = [];
  public url : string;

  constructor(
  	private _route : ActivatedRoute,
  	private _router : Router,
  	private _userService : UserService,
    private _uploadService : UploadService
  ) { 
  	this.title = "Actualizar mis datos";
  	this.user = this._userService.getIdentity();
  	this.identity = this.user;
  	this.token = this._userService.getToken();
    this.url = Global.url;
  }

  ngOnInit() {
  	//console.log("Componente de edit iniciado");
  }

  onSubmit() {
  	//console.log(this.user);
  	this._userService.updateUser(this.user).subscribe(
  		response => {
  			if(!response.userUpdated){
  				this.status = 'failed';
  			}else {
  				this.status = 'success';
  				localStorage.setItem('identity', JSON.stringify(response.userUpdated));
  				this.identity = this.user;

  				//Subida de imagen de usuario
          //console.log(this.filesToUpload);
          if(this.filesToUpload.length > 0) {
            this._uploadService.makeFilesRequest(this.url + "upload-image-user/" + this.user._id, [], this.filesToUpload, this.token, "image")
                               .then((result : any) => {
                                  //console.log(result.userUpdated.image);
                                  this.user.image = result.userUpdated.image;
                                  localStorage.setItem('identity', JSON.stringify(this.user));
                                });
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

  fileChangeEvent(fileInput : any) {
    this.filesToUpload = <Array<File>>fileInput.target.files;
  }

}