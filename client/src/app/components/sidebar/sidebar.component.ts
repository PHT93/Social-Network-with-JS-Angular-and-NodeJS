import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Global } from '../../services/global';
import { UserService } from '../../services/user.service';
import { PublicationService } from '../../services/publication.service';
import { UploadService } from '../../services/upload.service';
import { Publication } from '../../models/publication';

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  providers: [UserService, PublicationService, UploadService]
})
export class SidebarComponent implements OnInit {
	public url : string;
	public identity;
	public token;
	public stats;
	public status : string;
	public publication : Publication;
  public filesToUpload : Array<File> = [];

  constructor(
    private _route : ActivatedRoute,
    private _router : Router,
  	private _userService : UserService,
    private _publicationService : PublicationService,
    private _uploadService : UploadService
  ) {
  	this.url = Global.url;
  	this.identity = this._userService.getIdentity();
  	this.token = this._userService.getToken();
  	this.stats = this._userService.getStats();
  	this.publication = new Publication("", "", "", "", this.identity._id);
  }

  //Ouput
  @Output() sended = new EventEmitter();
  sendPublication(event) {
    //console.log(event);
    this.sended.emit({
      send: 'true'
    });
  }

  ngOnInit() {
  	//console.log("Componente de sidebar arrancado");
  }

  onSubmit(form, event) {
  	//console.log(this.publication);
    this._publicationService.addPublication(this.token, this.publication).subscribe(
      response => {
        if(!response.PublicationStored) {
          //this.publication = response.PublicationStored;
          this.status = 'failed';
        }else {
          //console.log(response.PublicationStored);
          if(this.filesToUpload && this.filesToUpload.length > 0) {
            this._uploadService.makeFilesRequest(this.url + 'upload-publication-file/' + response.PublicationStored._id, [], this.filesToUpload, this.token, 'image')
                               .then((result : any) => {
                                  //console.log(result);
                                  this.publication.file = result.PublicationUpdated.file;
                                  //console.log(this.publication.file);
                                  this.status = 'success';
                                  form.reset();
                                  this.sended.emit({ send: 'true' });
                                  this._router.navigate(['/timeline']);
                                });
          }else {
            this.status = 'success';
            form.reset();
            this.sended.emit({ send: 'true' });
            this._router.navigate(['/timeline']);
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
