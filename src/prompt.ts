import * as vscode from 'vscode';
import enforce from 'pumlhorse/lib/util/enforce';
import { IScope } from 'pumlhorse/lib/script/Scope';
import { pumlhorse } from 'pumlhorse/lib/PumlhorseGlobal';

export function promptForValue(ask: string, forValue: string, $scope: IScope): Thenable<string> {

    enforce(ask, 'ask').isString();
    enforce(forValue, 'for').isString();

    if (ask == null) {
        ask = forValue == null ? 'Enter value: ' : `Enter value for ${forValue}`;
    }

    const existingValue = $scope[forValue];
    if (existingValue != null) return existingValue;

    return vscode.window.showInputBox({
        prompt: ask
    })
        .then((answer) => {
            $scope[forValue] = answer;
            return answer;
        });
}

pumlhorse.module('vscodePrompt')
    .function('prompt', ['ask', 'for', '$scope', promptForValue]);