import { Component, OnInit, Input } from '@angular/core';
import { Face } from 'src/app/Face';

@Component({
  selector: 'app-face-item',
  templateUrl: './face-item.component.html',
  styleUrls: ['./face-item.component.css']
})
export class FaceItemComponent implements OnInit {
  @Input() face: Face = new Input;

  constructor() { }

  ngOnInit(): void {
  }

}
