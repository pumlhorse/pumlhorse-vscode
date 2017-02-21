import * as vscode from 'vscode';
import * as YAML from 'pumlhorse-yamljs';
import * as path from 'path';
import * as _ from 'underscore';
import { IProfile } from 'pumlhorse';


class ProfileManager
{
    private _onProfileChangedEmitter: vscode.EventEmitter<ProfileChangedEvent>;
    private _selectedProfileUri: vscode.Uri = null;

    public onProfileChanged: vscode.Event<ProfileChangedEvent>;

    constructor() {
        this._onProfileChangedEmitter = new vscode.EventEmitter<ProfileChangedEvent>()
        this.onProfileChanged = this._onProfileChangedEmitter.event;
    }

    async listProfiles(): Promise<vscode.Uri[]> {
        return await vscode.workspace.findFiles('**/*.pumlprofile', '**/(node_modules)/**');
    }
    
    async getProfile(defaultProfile: any, profileUri?: vscode.Uri): Promise<IProfile> {
        if (!defaultProfile) defaultProfile = {};

        if (profileUri == null) {
            profileUri = this._selectedProfileUri;
        }
        
        if (profileUri == null) return defaultProfile;
        
        const doc = await vscode.workspace.openTextDocument(profileUri);
        const profile: IProfile = YAML.parse(doc.getText());
        profile.include = this.makeRelative(profile.include, profileUri);
        profile.contexts = this.makeRelative(profile.contexts, profileUri);
        profile.filters = this.makeRelative(profile.filters, profileUri);
        return _.extend(profile, defaultProfile);
    }

    isProfileSelected(): boolean {
        return this._selectedProfileUri != null;
    }

    setProfileUri(uri: vscode.Uri) {
        if (uri === this._selectedProfileUri) return;
    
        const previousProfile = this._selectedProfileUri;
        this._selectedProfileUri = uri;
        
        this._onProfileChangedEmitter.fire(new ProfileChangedEvent(uri, previousProfile));
    }

    private makeRelative(paths: string[], profileUri: vscode.Uri): string[] {
        if (!paths) return paths;
        
        const profilePath = profileUri.fsPath;
        return paths.map(function (p) { return path.resolve(profilePath, '..', p.toString()) });
    }
}

export class ProfileChangedEvent {
    constructor(public newProfileUri: vscode.Uri, public oldProfileUri: vscode.Uri) {

    }
}

export const profileManager = new ProfileManager;