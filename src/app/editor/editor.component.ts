import { Component, HostListener, Input, OnChanges, OnInit } from '@angular/core';
import * as monaco from 'monaco-editor';
import { BenchmarkService } from '../benchmark.service';


@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, OnChanges {
  private editor!: monaco.editor.IStandaloneCodeEditor;

  public editorOptions = {language: 'javascript', mouseWheelZoom: true, minimap: {enabled: false}, automaticLayout: true};
  public code: string= 'for(let i = 0; i < 100; i++) {\n    console.log("Hello world!");\n}';

  @Input()
  public index!: number;

  constructor(private benchmark: BenchmarkService) { }

  ngOnInit(): void {
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
    this.onChange(this.code);

    this.benchmark.onResults.subscribe(() => {
      this.onResize();
    });
  }

  ngOnChanges() {
    this.onChange(this.editor?.getValue() ?? "");
  }

  onInit(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;
    this.editor.focus();
  }

  onChange(value: string){
    this.benchmark.submit(this.index, value);
  }

  @HostListener("window:resize")
  public onResize(){
    this.editor.layout({} as monaco.editor.IDimension);
  }

}
