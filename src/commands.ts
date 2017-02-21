import * as path from 'path';
import { SessionOutput } from './SessionOutput';
import * as vscode from 'vscode';
import { App, IProfile } from 'pumlhorse';
import { profileManager } from './profileManager';

var _context: vscode.ExtensionContext;


class Command implements vscode.QuickPickItem {
    public showInPalette: boolean = false;
    public description: string = null;
    public label: string;
    constructor(public name: string,
        public command: string,
        public method: (...args: any[]) => any) {   
            this.label = name;
    }
}

class PaletteCommand extends Command {

    public showInPalette: boolean = true;

    constructor(name: string,
        command: string,
        method: (...args: any[]) => any,
        description: string,
        public icon: string = null) {
            super(name, command, method);
            this.label = icon != null ? `$(${icon}) ${name}`: name;
            this.description = description;
    }
}

const paletteCommands: vscode.QuickPickItem[] = [];

class Commander {
    
    private commands: Command[] = [
        new Command('Show Command Palette', 'pumlhorse.showCommandPalette', () => this.showCommandPalette()),
        new Command('Run File', 'pumlhorse.runFile', (uri) => this.runFile(uri)),
        new PaletteCommand('Run Current File', 'pumlhorse.runCurrentFile', () => this.runCurrentFile(), 'Run the current file', 'triangle-right'),
        new PaletteCommand('Run Workspace', 'pumlhorse.runWorkspace', () => this.runWorkspace(), 'Run all Pumlhorse files in the workspace', 'globe'),
        new PaletteCommand('Run Profile', 'pumlhorse.runProfile', (uri) => this.runProfile(uri), 'Run a Pumlhorse profile', 'file-submodule'),
        new PaletteCommand('Set Profile', 'pumlhorse.setProfile', (uri) => this.setProfile(uri), 'Set the current Pumlhorse profile', 'settings'),
    ];
    

    public registerCommands(context: vscode.ExtensionContext) {
        _context = context;
        
        this.commands.forEach(cmd => {
            const disposable = vscode.commands.registerCommand(cmd.command, cmd.method);
            context.subscriptions.push(disposable);

            if (cmd.showInPalette) {
                paletteCommands.push(cmd);
            }
        });
    }
    
    public async showCommandPalette() {
        
        const pick = await vscode.window.showQuickPick(paletteCommands);
        
        if (!pick) return;

        try {
            await vscode.commands.executeCommand((<Command>pick).command);
        }
        catch (err) {
            console.error(err);
        }
    }

    public async runFile(fileUri: vscode.Uri) {
        var profile: IProfile = {
            include: [fileUri.fsPath]
        }

        return await this.runProfileInternal(profile);
    }

    public async runCurrentFile() {
        var fileName = vscode.window.activeTextEditor.document.fileName;
    
        if (fileName == null) {
            if (vscode.workspace.rootPath) return await this.runWorkspace();
            return vscode.window.showErrorMessage('You must open a file or workspace before you can run Pumlhorse');
        }
        
        var profile: IProfile = {
            include: [fileName]
        }

        return await this.runProfileInternal(profile);
    }

    public async runWorkspace() {
        var workspacePath = vscode.workspace.rootPath
        if (!workspacePath) {
            return vscode.window.showErrorMessage("You must open a folder before you can run on a workspace")
        }
        
        var defaultProfile = {
            include: [workspacePath],
            recursive: true
        }
        const profile = await profileManager.getProfile(defaultProfile);
        return await this.runProfileInternal(profile);
    }

    public async runProfile(uri: vscode.Uri): Promise<any> {
        if (!profileManager.isProfileSelected() && uri == null) {
            const result = await vscode.window.showInformationMessage('You do not have an active profile.', 'Choose Profile');

            if (result == null) return;

            await this.setProfile();

            if (!profileManager.isProfileSelected()) return;
        }
        
        var profile = await profileManager.getProfile(null, uri);
        return await this.runProfileInternal(profile);
    }

    public async setProfile(profileUri?: vscode.Uri): Promise<any> {
        if (profileUri != null) {
            profileManager.setProfileUri(profileUri);
            return;
        }

        const workspacePath = vscode.workspace.rootPath;
        if (workspacePath == null) {
            return vscode.window.showErrorMessage('You must open a folder before you cant set a profile');
        }

        const profileUris = await profileManager.listProfiles();

        if (profileUris.length == 0) {
            const shouldCreate = await vscode.window.showInformationMessage('No profiles found.', 'Create Profile');

            if (shouldCreate == null) return;
            return await this.createProfile();
        }

        const quickPickItems = profileUris.map(uri => new ProfileItem(uri));
        const profile = await vscode.window.showQuickPick(quickPickItems);

        if (profile == null) return;

        profileManager.setProfileUri(profile.uri);
    }


    async createProfile() {
        var profileName = await vscode.window.showInputBox({
            prompt: "Profile name"
        });
            
        if (!profileName) return;
            
        var filePath = path.join(vscode.workspace.rootPath, `./${profileName}.pumlprofile`);
        const newProfileUri = vscode.Uri.parse(`untitled:${filePath}`);
        const doc = await vscode.workspace.openTextDocument(newProfileUri);

        const editor = await vscode.window.showTextDocument(doc);
        await editor.edit(builder => builder.insert(new vscode.Position(0, 0), 
            "include:\r\n" +
            "  #- filename.puml\r\n" +
            "  #- directoryName\r\n" +
            "contexts:\r\n" +
            "  #- context1.yml\r\n" +
            "  #- context2.json\r\n" +
            "recursive: true #Any included directories will be searched recursively\r\n" +
            "synchronous: false #if true, scripts will run one at a time\r\n")
        );

        var disposables: vscode.Disposable[] = []
        var watcher = vscode.workspace.createFileSystemWatcher("**/" + profileName + ".pumlprofile", false, true, true)
        
        watcher.onDidCreate(uri => {
                profileManager.setProfileUri(uri)
                disposables.forEach(d => d.dispose());
            }, null, disposables);
        disposables.push(watcher);
    }

    private async runProfileInternal(profile: IProfile) {
        var app = new App();
        return await app.runProfile(profile, new SessionOutput());    
    }

}

class ProfileItem implements vscode.QuickPickItem {
    public label: string;
    public description: string;
    public uri: vscode.Uri;
    
    constructor(profileUri: vscode.Uri) {
        this.label = profileUri.fsPath
        this.description = profileUri.fsPath;
        this.uri = profileUri
    }
}

var commander;

export function registerCommands(context: vscode.ExtensionContext) {
    if (commander === undefined) {
        commander = new Commander();
        commander.registerCommands(context);
    }
}