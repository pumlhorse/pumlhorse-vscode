import * as vscode from 'vscode';
import * as pumlhorse from 'pumlhorse';

const outputChannel: vscode.OutputChannel = vscode.window.createOutputChannel("Pumlhorse");
outputChannel.show();

export class SessionOutput implements pumlhorse.profile.ISessionOutput {
    
    private scriptLogs: { [scriptId: string]: BufferedLogger; } = { }

    onSessionStarted() {}
    
    onScriptPending(scriptId: string, fileName: string, scriptName: string) {
        this.scriptLogs[scriptId] = new BufferedLogger(fileName, scriptName);
    }

    onScriptStarted(scriptId: string) {}

    onLog(scriptId: string, logLevel: string, message: string): any
    {
        this.scriptLogs[scriptId].log(logLevel, message);
    }

    onHttpSent() {}
    
    onHttpReceived() {}
    
    onScriptFinished(scriptId: string, error: any) {
        const logger = this.scriptLogs[scriptId];

        if (error != null) {
            logger.log("error", error.message != null ? error.message : error);
        }
        logger.flush(error != null);
    }

    onSessionFinished(scriptsPassed: number, scriptsFailed: number) {



        var total = scriptsPassed + scriptsFailed;
        if (total == 0) {
            writeWarning("0 scripts run. No .puml files found");
        }
        else {
            var totalMessage = total == 1
                ? '1 script run'
                : total + ' scripts run';
            var failures = scriptsFailed > 0 
                ? Markup.red(`${scriptsFailed} failure${scriptsFailed == 1 ? '' : 's'}`)
                : Markup.blue('0 failures');
            outputChannel.appendLine(Markup.blue(`${totalMessage}, `) + failures);
        }
    }
}

class Markup {
    static blue = Markup.wrapper(Array(2).join("​"));
    static red = Markup.wrapper(Array(3).join("​"));
    static yellow = Markup.wrapper(Array(4).join("​"));
    static brown = Markup.wrapper(Array(5).join("​"));
    static green = Markup.wrapper(Array(6).join("​"));
    static underline = Markup.wrapper(Array(2).join("‌⁠"));
    static indent(text: string, padding: number) {
        return Array(padding).join(" ") + text;
    }

    private static wrapper(markup: string) : Function {
        return (text) => markup + text + markup;
    }
}


class LogMessage {
    constructor(public message: string, public logger: (msg: string) => void) {}
}

function writeWarning(msg) {
    outputChannel.appendLine(Markup.yellow('WARNING: ' + msg));
}

function writeError(msg) {
    outputChannel.appendLine(Markup.red('ERROR: ' + msg));
}

class BufferedLogger {
    private messages: LogMessage[] = [];

    constructor(private fileName: string, private scriptName: string) {
        
    }
    
    flush(isFailed: boolean) {
        if (this.messages.length > 0) {
            outputChannel.appendLine(Markup.green('--------------'));
            outputChannel.append(Markup.green(`## ${this.scriptName} - `));
            outputChannel.append(Markup.underline(this.fileName));
            if (isFailed) {
                outputChannel.append(Markup.red(' [FAILED]'));
            }
            outputChannel.appendLine(Markup.green(' ##'));
            this.messages.forEach(function (m) {
                m.logger(Markup.indent(m.message, 2));
            })
        }
    }
    
    log(level, message) {
        let logger: (msg: string) => void = msg => outputChannel.appendLine(msg);
        if (level == 'warn') {
            logger = msg => writeWarning(msg);
        }
        else if (level == 'error') {
            logger = msg => writeError(msg);
        }
                
        this.messages.push(new LogMessage(message, logger));
    }
}