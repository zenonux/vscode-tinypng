// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { initOssConfig } from './commands/oss';
import { compressFile, compressFolder, compressFolderRecursive } from './commands/tinypng';

//wait vscode upgrade node version
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  vscode.commands.executeCommand('setContext','tinypng-oss.enabled',true);


  compressFile(context);
  compressFolder(context);
  compressFolderRecursive(context);
  initOssConfig(context);
}

// this method is called when your extension is deactivated
export function deactivate() {}
