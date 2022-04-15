import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  imageUrl: string = '';

  constructor(data: DataService) { 
    data.execChangeURL.subscribe((value)=>{
      this.imageUrl = value;
    })

    //data.DetectFaceExtract(this.imageUrl);
  }

  ngOnInit(): void {
  }

}
