import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent implements OnInit {
  imageUrl:string = '';

  constructor(private data: DataService) { }

  ngOnInit(): void {}

  DetectFaceExtract(imageUrl:string){
    if(this.imageUrl!=''){
      this.data.imageUrlChange(this.imageUrl);
      //this.data.DetectFaceExtract(this.imageUrl); //this is for face identification
      //this.data.IdentifyInPersonGroup();          //this is for face recognition
      this.imageUrl = '';
    }
  }
}
