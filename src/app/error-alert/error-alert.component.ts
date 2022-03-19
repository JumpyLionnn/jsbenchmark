import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DeleteDialogData } from '../benchmark/delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-error-alert',
  templateUrl: './error-alert.component.html',
  styleUrls: ['./error-alert.component.scss']
})
export class ErrorAlertComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: AlertData) { }

  ngOnInit(): void {
  }

}

export interface AlertData {
  title: string,
  message: string
}
