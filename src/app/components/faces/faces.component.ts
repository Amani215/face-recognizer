import { Component, OnInit } from '@angular/core';
import {FACES} from '../../mock-faces'
import {Face} from '../../Face'

@Component({
  selector: 'app-faces',
  templateUrl: './faces.component.html',
  styleUrls: ['./faces.component.css']
})
export class FacesComponent implements OnInit {
  faces: Face[] = FACES;
  
  constructor() { }

  ngOnInit(): void {
  }

}
