import { Component, Inject, OnInit, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-progressbar',
  templateUrl: './progressbar.component.html',
  styleUrls: ['./progressbar.component.scss']
})
export class ProgressbarComponent implements OnInit {
  public value: number;
  public message: string;
  public show: boolean;
  constructor(@Inject(MAT_DIALOG_DATA) public data: ProgressbarData, private dialogRef: MatDialogRef<ProgressbarComponent>) { 
    this.value = data.value;
    this.message = data.message;
    this.show = data.show;
    dialogRef.disableClose = true;
    data.onUpdate.subscribe((progress) => {
      this.value += progress.progress ?? 0;
      this.message = progress.message ?? this.message;
      this.show = progress.show ?? true;
    });
  }

  ngOnInit(): void {
  }

}

interface ProgressbarData {
  value: number,
  message: string,
  title: string,
  show: boolean,
  onUpdate: EventEmitter<{progress?: number, message?: string, show?: boolean}>
}
