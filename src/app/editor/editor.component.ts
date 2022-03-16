import { Component, OnInit } from '@angular/core';
import * as monaco from 'monaco-editor';


@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {
  private editor!: monaco.editor.IStandaloneCodeEditor;
  constructor() { }

  ngOnInit(): void {
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
  }

  public editorOptions = {language: 'javascript', mouseWheelZoom: true, minimap: {enabled: false}};
  public code: string= 'function x() {\n    console.log("Hello world!");\n}';
  onInit(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;
    this.editor.focus();
    
  }

  onChange(value: string){
    
  }

}
