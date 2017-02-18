import * as vscode from 'vscode';
import * as YAML from 'pumlhorse-yamljs';
import * as path from 'path';
import * as _ from 'underscore';
import { IProfile } from 'pumlhorse';


class ProfileManager
{
    private _onProfileChanged: vscode.EventEmitter<ProfileChangedEvent>;
    private _selectedProfileUri: vscode.Uri = null;

    constructor() {
        this._onProfileChanged = new vscode.EventEmitter<ProfileChangedEvent>()
        
    }

    async listProfiles(): Promise<vscode.Uri[]> {
        return await vscode.workspace.findFiles('**/*.pumlprofile', '**/(node_modules|puml_modules)/**');
    }
    
    async getProfile(defaultProfile): Promise<IProfile> {
        if (!defaultProfile) defaultProfile = {}
        
        if (!this._selectedProfileUri) return defaultProfile;
        
        const doc = await vscode.workspace.openTextDocument(this._selectedProfileUri);
        const profile: IProfile = YAML.parse(doc.getText());
        profile.include = this.makeRelative(profile.include);
        profile.contexts = this.makeRelative(profile.contexts);
        profile.filters = this.makeRelative(profile.filters);
        return _.extend(profile, defaultProfile);
    }

    isProfileSelected(): boolean {
        return this._selectedProfileUri != null;
    }

    setProfileUri(uri: vscode.Uri) {
        if (uri === this._selectedProfileUri) return;
    
        const previousProfile = this._selectedProfileUri;
        this._selectedProfileUri = uri;
        
        this._onProfileChanged.fire(new ProfileChangedEvent(uri, previousProfile));
    }

    private makeRelative(paths: string[]): string[] {
        if (!paths) return paths;
        
        return paths.map(function (p) { return path.resolve(this._selectedProfileUri.fsPath, '..', p) });
    }
}

class ProfileChangedEvent {
    constructor(public newProfileUri: vscode.Uri, public oldProfileUri: vscode.Uri) {

    }
}

export const profileManager = new ProfileManager;