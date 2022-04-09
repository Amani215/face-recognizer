import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  title: string = 'Face Recognizer';
  imageUrl:string = '';

  constructor(private data: DataService) { }

  ngOnInit(): void {
  }

  addBtn(){
    console.log("Add face");
  }

  DetectFaceExtract(imageUrl:string){
    this.data.DetectFaceExtract(imageUrl);
  }
}
