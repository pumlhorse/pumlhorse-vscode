# Pumlhorse Visual Studio Code extension

[Pumlhorse](http://pumlhorse.com) is a scripting language with a simple, highly readable syntax. It can be used for automated testing, workflows, scripting utilities, and much more. More information is available on the [Pumlhorse site](http://pumlhorse.com).

## Commands

Access the Command Palette by pressing the beaker icon in the lower left or by using the shortcut `ctrl+alt+p p`. This menu lets you:
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

Another common situation is using [context files](http://pumlhorse.com/reference/engine/v2/lessons/lesson6_advancedCommandLine#run-with-a-given-set-of-data) to extract environmental variables from the script. This allows you to have a single script that can be run in multiple 
environments. In this case, you can create a profile that uses those context files.

## Sample Scripts

Try these scripts to get a feel for what Pumlhorse can do.

**Print the latest version of Pumlhorse**

```yaml
name: Find the latest version of Pumlhorse
steps:
  - response = http.get:
      url: https://api.github.com/repos/pumlhorse/pumlhorse/contents/package.json
      headers:
        Accept: application/vnd.github.v3+json
  - http.isOk: $response # Ensure we got back a 200
  - decoded = convertFromBase64: $response.json.content
  - packageData = fromJson: $decoded
  - log: Current version of Pumlhorse is $packageData.version
functions:
  convertFromBase64:
    - input
    - return new Buffer(input, 'base64').toString('utf-8')
```

**Print OS information**

```yaml
name: Print OS information
steps:
  # Log OS information using the Node 'os' module
  - osMod = import: os
  - log: HOSTNAME: $osMod.hostname()
  - log: RUNNING
  - log: OPERATING SYSTEM: $osMod.type() $osMod.arch()
  - log: CPU CORES: $osMod.cpus().length
  - log: TOTAL MEMORY: ${ osMod.totalmem() / 1000000 } MB
```

**Check whether it's the weekend**

```yaml
name: Check if it's the weekend
functions:
  getTodaysDate:
    - return new Date().getDay()
steps:
  - dayOfWeek = getTodaysDate
  - if:
      value: ${ dayOfWeek == 5 }
      is true:
        - log: Congratulations, today is Friday!
      is false:
        - if:
            value: ${ dayOfWeek == 6 || dayOfWeek == 0}
            is true:
              - log: Congratulations, it's the weekend!
            is false:
              - log: Sorry, it's still not the weekend... 
```

## Feedback

I am very interested in any feedback on [this extension](https://github.com/pumlhorse/pumlhorse-vscode) or [Pumlhorse](https://github.com/pumlhorse/pumlhorse) in general. Please feel free to submit an issue on Github.