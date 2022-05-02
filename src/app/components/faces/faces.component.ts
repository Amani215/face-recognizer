import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import {Face} from '../../Face'

@Component({
  selector: 'app-faces',
  templateUrl: './faces.component.html',
  styleUrls: ['./faces.component.css']
})
export class FacesComponent implements OnInit {
  faces: Face[] = [];
  
  constructor(private data: DataService) {
    this.data.execChangeFaces.subscribe((value)=>{
      this.faces = value;
    })
   }

  ngOnInit(): void {
    //this.data.DetectFaceExtract(this.data.execChangeURL.getValue());
  }

}
