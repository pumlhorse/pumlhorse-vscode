# Pumlhorse Visual Studio Code extension

[Pumlhorse](http://pumlhorse.com) is a scripting language with a simple, highly readable syntax.
It can be used for automated testing, workflows, scripting utilities, and much more.
More information is available on the [Pumlhorse site](http://pumlhorse.com).

## Commands

Access the Command Palette by pressing the beaker icon in the lower left or by using the shortcut `ctrl+alt+p p`.
This menu lets you:
* Run the current file (`ctrl+alt+p c`)
* Run all files in the workspace (`ctrl+alt+p a`)
* Run a [profile](http://pumlhorse.com/reference/engine/v2/profile_schema) (`ctrl+alt+p o`)
* Set the current profile

## Running Scripts

When you run a script, the output will show in the Pumlhorse console.

![](https://raw.githubusercontent.com/pumlhorse/pumlhorse-vscode/master/media/demo/output_console.png)

In addition to the Command Palette, you can run a single file with the "play" button on the top right of the file editor.

![](https://raw.githubusercontent.com/pumlhorse/pumlhorse-vscode/master/media/demo/file_editor.png)

You can also right-click a file or folder and choose "Run in Pumlhorse"

## Running Profiles

Profiles allow you to run complex configurations in one go. For instance, you may have a set of scripts you want to run
all at the same time. You can create a profile that includes those scripts.

Another common situation is using [context files](http://pumlhorse.com/reference/engine/v2/lessons/lesson6_advancedCommandLine#run-with-a-given-set-of-data)
to extract environmental variables from the script. This allows you to have a single script that can be run in multiple 
environments. In this case, you can create a profile that uses those context files.

## Feedback

I am very interested in any feedback on [this extension](https://github.com/pumlhorse/pumlhorse-vscode) or [Pumlhorse](https://github.com/pumlhorse/pumlhorse) in general. Please feel free to submit an issue on Github.