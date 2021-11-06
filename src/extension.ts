// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';


/**
 * Function to compress a single image.
 * @param {Object} file
 */
 const compressImage = (file: vscode.Uri) => {
    const shouldOverwrite: boolean = vscode.workspace
        .getConfiguration('tinypng')
        .get('forceOverwrite');

    // Note: Define the destination file path for the compressed image.
    let destinationFilePath = file.fsPath;
    // In case the extension should not overwrite the source file (default)…
    if (!shouldOverwrite) {
        // …take the postfix defined in the settings.
        const postfix = vscode.workspace
            .getConfiguration('tinypng')
            .get('compressedFilePostfix');

        const parsedPath = path.parse(file.fsPath);

        // Generate file in format: <name><postfix>.<ext>
        destinationFilePath = path.join(
            parsedPath.dir,
            `${parsedPath.name}${postfix}${parsedPath.ext}`
        );
    }

    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left
    );
    statusBarItem.text = `Compressing file ${file.fsPath}...`;
    statusBarItem.show();
    return tinify
        .fromFile(file.fsPath)
        .toFile(destinationFilePath, (error: Error) => {
            statusBarItem.hide();
            if (error) {
                if (error instanceof tinify.AccountError) {
                    // Verify your API key and account limit.
                    console.error(
                        'Authentication failed. Have you set the API Key?'
                    );
                    vscode.window.showErrorMessage(
                        'Authentication failed. Have you set the API Key?'
                    );
                } else if (error instanceof tinify.ClientError) {
                    // Check your source image and request options.
                    console.error(
                        'Ooops, there is an error. Please check your source image and settings.'
                    );
                    vscode.window.showErrorMessage(
                        'Ooops, there is an error. Please check your source image and settings.'
                    );
                } else if (error instanceof tinify.ServerError) {
                    // Temporary issue with the Tinify API.
                    console.error('TinyPNG API is currently not available.');
                    vscode.window.showErrorMessage(
                        'TinyPNG API is currently not available.'
                    );
                } else if (error instanceof tinify.ConnectionError) {
                    // A network connection error occurred.
                    console.error(
                        'Network issue occurred. Please check your internet connectivity.'
                    );
                    vscode.window.showErrorMessage(
                        'Network issue occurred. Please check your internet connectivity.'
                    );
                } else {
                    // Something else went wrong, unrelated to the Tinify API.
                    console.error(error.message);
                    vscode.window.showErrorMessage(error.message);
                }
            } else {
                vscode.window.showInformationMessage(
                    `Successfully compressed ${file.fsPath} to ${destinationFilePath}!`
                );
            }
        });
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	let disposableCompressFile = vscode.commands.registerCommand('vscode-tinypng.compressFile', compressImage);
	context.subscriptions.push(disposableCompressFile);

	let disposableCompressFolder: vscode.Disposable = vscode.commands.registerCommand(
        'vscode-tinypng.compressFolder',
         (folder: vscode.Uri) =>{
            vscode.workspace
                .findFiles(
                    new vscode.RelativePattern(
                        folder.path,
                        `**/*.{png,jpg,jpeg}`
                    )
                )
                .then((files: any) => files.forEach(compressImage));
        }
    );
    context.subscriptions.push(disposableCompressFolder);
}

// this method is called when your extension is deactivated
export function deactivate() {}
