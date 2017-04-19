import * as vscode from 'vscode';
import * as YAML from 'pumlhorse-yamljs';
import * as path from 'path';
import * as _ from 'underscore';
import { IProfile, Module } from 'pumlhorse';


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
        profile.modules = this.makeModulesRelative(profile.modules, profileUri);
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

    private makeModulesRelative(modules: Module[], profileUri: vscode.Uri): Module[] {
        if (modules == null) return modules;

        return _.map(modules, (m) => { 
            return {
                name: m.name,
                path: this.makeRelativePath(m.path, profileUri)
            };
        });
    }

    private makeRelative(paths: string[], profileUri: vscode.Uri): string[] {
        if (!paths) return paths;
        
        return paths.map(p => this.makeRelativePath(p, profileUri));
    }

    private makeRelativePath(filePath: string, profileUri: vscode.Uri) {
        return path.resolve(profileUri.fsPath, '..', filePath.toString())
    }
}

export class ProfileChangedEvent {
    constructor(public newProfileUri: vscode.Uri, public oldProfileUri: vscode.Uri) {

    }
}

export const profileManager = new ProfileManager;