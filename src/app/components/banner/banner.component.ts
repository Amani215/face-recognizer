//TODO
//make banner and card children of same parent
//output url to parent and input it from parent to card

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
    this.imageUrl = '';
    //this.data.DetectFaceExtract(this.imageUrl);
  }
}
