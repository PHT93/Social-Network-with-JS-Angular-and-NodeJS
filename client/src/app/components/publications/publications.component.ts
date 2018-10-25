import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Publication } from '../../models/publication';
import { Global } from '../../services/global';
import { UserService } from '../../services/user.service';
import { PublicationService } from '../../services/publication.service';
declare var $ : any;

@Component({
  selector: 'publications',
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.css'],
  providers: [UserService, PublicationService]
})
export class PublicationsComponent implements OnInit {
	public title : string;
  public status : string;
  public page;
	public url : string;
	public identity;
	public token;
	public publicationsIFollow : Publication[] = [];
	public totalItems;
	public pages;
	public itemsPerPage;
	public noMore : boolean;
  public loading : boolean;
	@Input() user : string;

  constructor(
    private _route : ActivatedRoute,
    private _router : Router,
    private _userService : UserService,
    private _publicationService : PublicationService
  ) { 
    this.title = 'Publications';
    this.url = Global.url;
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.page = 1;
    this.noMore = false;
    this.loading = true;
  }

  ngOnInit() {
  	//console.log("El componente timeline se ha cargado");
  	this.getPublications(this.user, this.page);
  }

  getPublications(userId, page, adding = false) {
    this._publicationService.getPublicationsUser(this.token, userId, page).subscribe(
      response => {
        //console.log(response);
        if(response.PublicationsIFollow) {
          this.totalItems = response.TotalItems;
          this.pages = response.Pages;
          this.itemsPerPage = response.ItemsPerPage;
          this.loading = false;

          if(!adding) {
            this.publicationsIFollow = response.PublicationsIFollow;
          }else {
            var arrayA = this.publicationsIFollow;
            var arrayB = response.PublicationsIFollow;
            this.publicationsIFollow = arrayA.concat(arrayB);

            $("html, body").animate({
              "scrollTop": $("html, body").prop("scrollHeight")
            }, 500);
          }

          if(page > this.pages) {
            this._router.navigate(['/timeline']);
          }

        }else {
          this.status = 'failed';
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

  viewMore() {
    this.page += 1;
    if(this.page == this.pages) {
      this.noMore = true;
    }

    this.getPublications(this.user, this.page, true);
  }

  returnToTop() {
    $("html, body").animate({
      "scrollTop": 0
    }, 100);
  }

  refresh(event) {
    //console.log(event.send);
    this.getPublications(this.user, 1);
  }

}
