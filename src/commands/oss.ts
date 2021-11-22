import * as vscode from 'vscode';
import Oss from '../services/oss';
export const initOssConfig = (context: vscode.ExtensionContext) => {
    let command: vscode.Disposable =
      vscode.commands.registerCommand(
        'vscode-tinypng.initOssConfig',
        async () => {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length<=0 ) {
                  await vscode.window.showErrorMessage('Tinypng expects to work at a folder.');
                  return;
            }
            if (workspaceFolders.length === 1) {
               await Oss.newConfig(workspaceFolders[0].uri.fsPath);
                return;
              }
        }
      );
    context.subscriptions.push(command);
  };
  