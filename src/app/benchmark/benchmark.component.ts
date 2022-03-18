import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { MatDialog } from '@angular/material/dialog';

import { BenchmarkService } from '../benchmark.service';
import BenchmarkResults from '../benchmarkResults';
import CodeBlock from '../code-block';
import { DeleteDialogComponent } from './delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-benchmark',
  templateUrl: './benchmark.component.html',
  styleUrls: ['./benchmark.component.scss']
})
export class BenchmarkComponent implements OnInit {
  public iterationCount: number = 10;
  public showResults: boolean = false;

  public codeBlocksLabels: CodeBlock[] = [{name: "code block 1"}];
  public selectedIndex = 0;
  private lastCodeBlockId: number = 1;

  public benchmarkResults: BenchmarkResults = new Map();

  @ViewChild("blocks", {static: true})
  private codeBlocks!: MatSelectionList;

  constructor(private benchmark: BenchmarkService, private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  public onRunClicked(){
    this.benchmarkResults = this.benchmark.execute(this.iterationCount);
    this.showResults = true;
    this.benchmark.onResults.emit();
  }

  public addCodeBlock(){
    this.codeBlocksLabels.splice(++this.selectedIndex, 0, {name: `code block ${++this.lastCodeBlockId}`});
  }

  public removeSelectedCodeBlock(){
    if(this.codeBlocksLabels.length > 1){
      // making a dialog to make sure the user want to delete it
      const dialogRef = this.dialog.open(DeleteDialogComponent, {
        data: {
          codeBlockName: this.codeBlocksLabels[this.selectedIndex].name
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if(result){ // if the user chose to delete
          // deleteing all of the blocks after the deleted index including because after the update all of the editor after will resubmit their content
          this.benchmarkResults.delete(this.selectedIndex);
          for(let i = this.selectedIndex; i < this.codeBlocksLabels.length; i++){
            delete this.benchmark.sources[i];
            if(this.benchmarkResults.has(i)){
              this.benchmarkResults.set(i - 1, this.benchmarkResults.get(i)!);
              this.benchmarkResults.delete(i);
            }
          }
          this.codeBlocksLabels.splice(this.selectedIndex, 1);
          if(this.selectedIndex === 0){
            // TODO: on selecting this one it is not marking it as selected in the view
            this.codeBlocks.selectedOptions.select(this.codeBlocks.options.get(1)!);
          }
          else{
            this.codeBlocks.selectedOptions.select(this.codeBlocks.options.get(--this.selectedIndex)!);
          }
        }
      });
    }
  }

  public renameSelectedCodeBlock(){
    // TODO
  }

  public onCodeBlockChanges(e: MatSelectionListChange){
    this.selectedIndex = e.options[0].value;
  }
}
