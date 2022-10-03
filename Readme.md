# YDLR-CLI - a youtube command line interface app

## Table of Contents

- [General info](#general-info)
- [Modules](#modules)
- [Setup](#setup)

## General info

A CLI tool that automates youtube videos downloads and converts youtube videos to audios.

## Modules

The node modules used for this projects are

- Commander
- Inquirer
- Ytdl-core
- Sqlite3
- etc.

with their versions shown in the package.json file.

## Setup

To run this project (i.e. locally),

- Clone the repo:

```
$ git clone https://github.com/VictorChukwudi/ydlr-cli.git
```

- Open the folder and run the commands:

```
$ npm install
$ npm link
```

- Finally to run and test the tool enter:

```
$ ydlr-cli
```

This command gives you a list of the allowed commands. You can the try out the tool.

### List of Commands

This CLI has the following commands:

- Usage:

```
$ ydlr-cli <command>
```

| Command | Description                                                                      |
| ------- | -------------------------------------------------------------------------------- |
| sdir    | sets or updates a custom download path for storing the downloaded video or audio |
| rdir    | removes an already set custom download directory path                            |
| dld     | downlaods a youtube video or audio                                               |
| -V      | check the version of the program                                                 |
| -h      | help command                                                                     |

## Contribution:

Head over to the [CONTRIBUTING.md]() to know how to contribute to this work.
