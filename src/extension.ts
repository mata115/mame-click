import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	const provider = new MainViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(MainViewProvider.viewType, provider));

	context.subscriptions.push(
		vscode.commands.registerCommand('mameClick.addColor', () => {
			provider.addColor();
		}));

	context.subscriptions.push(
		vscode.commands.registerCommand('mameClick.clearColors', () => {
			provider.clearColors();
		}));
}

class MainViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'mameClick.mainView';

	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		_context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(data => {
			switch (data.type) {
				case 'colorSelected':
					{
						vscode.window.activeTextEditor?.insertSnippet(new vscode.SnippetString(`#${data.value}`));
						break;
					}
			}
		});
	}

	public addColor() {
		if (this._view) {
			this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
			this._view.webview.postMessage({ type: 'addColor' });
		}
	}

	public clearColors() {
		if (this._view) {
			this._view.webview.postMessage({ type: 'clearColors' });
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

		const imageUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'mame.png'));

		const nonce = getNonce();

		return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="Content-Security-Policy"
        content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">

      <link href="${styleMainUri}" rel="stylesheet">
      <title>mame click</title>
    </head>
    <body>
      <div id="game-container">
        <img id="mame-image" src="${imageUri}" alt="mame" />
        <div id="points-display">豆: 0</div>
        <button id="upgrade-button">アップグレード</button>
        <canvas id="bean-canvas" width="300" height="200"></canvas>
      </div>

      <!-- 🔽 画像URLを JS に渡す：main.js より前に定義 -->
      <script nonce="${nonce}">
        const mameImageSrc = "${imageUri}";
      </script>

      <!-- 🔽 必ず mameImageSrc 定義のあとに main.js を読み込む -->
      <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
    </html>`;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
