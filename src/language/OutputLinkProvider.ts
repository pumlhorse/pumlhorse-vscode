import * as vscode from 'vscode';
import * as path from 'path';

export default class OutputLinkProvider implements vscode.DocumentLinkProvider {

    private linkMarker = Array(2).join("‌⁠"); //Unicode character
	private _linkPattern = new RegExp(this.linkMarker + '(.+)' + this.linkMarker, "g");

	constructor() { }

	public provideDocumentLinks(document: vscode.TextDocument, _token: vscode.CancellationToken): vscode.DocumentLink[] {
		const results: vscode.DocumentLink[] = [];
		const text = document.getText();

		this._linkPattern.lastIndex = 0;
		let match: RegExpMatchArray | null;
		while ((match = this._linkPattern.exec(text))) {
			const link = match[1];
			const offset = (match.index || 0) + 2;
			const linkStart = document.positionAt(offset);
			const linkEnd = document.positionAt(offset + link.length);
			try {
				results.push(new vscode.DocumentLink(
					new vscode.Range(linkStart, linkEnd),
					this.getLink(link)));
			} catch (e) {
				// noop
			}
		}

		return results;
	}

	private getLink(link: string): vscode.Uri {
		const uri = vscode.Uri.file(link);
		// return vscode.Uri.parse(`command:vscode.open?resource=${uri}`);
		return vscode.Uri.parse(`command:_pumlhorse.openScriptLink?${encodeURIComponent(JSON.stringify({ file: link }))}`);
	}
}