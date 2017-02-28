'use strict';
import * as path from 'path';
import { registerCommands } from './commands';
import * as vscode from 'vscode';
import { profileManager, ProfileChangedEvent } from './profileManager';
import OutputLinkProvider from './language/OutputLinkProvider';

var _statusBarItem;

export function activate(context: vscode.ExtensionContext) {

    _statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    _statusBarItem.command = 'pumlhorse.showCommandPalette';
    _statusBarItem.tooltip = 'Show Pumlhorse commands';
    setStatusBar();

    registerCommands(context);
    vscode.languages.registerDocumentLinkProvider('pumlhorse-output', new OutputLinkProvider)

    profileManager.onProfileChanged(handleProfileChanged);
}


var _profileName
function handleProfileChanged(ev: ProfileChangedEvent) {
    _profileName = path.basename(ev.newProfileUri.fsPath, '.pumlprofile')
    setStatusBar();
}
    
var interval
function setStatusBar(isBusy?: boolean) {
    
    var iconText = '$(beaker) ' + (_profileName ? _profileName : '(no profile)')
    _statusBarItem.text = iconText
    _statusBarItem.show()
    
    if (isBusy == true) {
        if (!interval) {
            var index = 0
            interval = setInterval(function () {
                _statusBarItem.text = `${iconText} ${'.'.repeat(index)}`
                _statusBarItem.show()
                index = (index + 1) % 5
            }, 120)
        }
    }
    else if (interval) {
        clearInterval(interval)
        interval = null
    }
    
}

export function deactivate() {
}