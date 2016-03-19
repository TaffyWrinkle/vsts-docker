/// <reference path="../../../typings/vsts-task-lib/vsts-task-lib.d.ts" />
"use strict";
var tl = require("vsts-task-lib/task");

var action = tl.getInput("action", true);

switch (action) {
    case "run a container":
        var dockerRun = require("./dockerRun");
        dockerRun.dockerRun();
        break;
    case "build an image":
        var dockerBuild = require("./dockerBuild");
        dockerBuild.dockerBuild();
        break;
    case "publish image":
        var dockerPublish = require("./dockerPublish");
        dockerPublish.dockerPublish();
        break;
    case "run a docker command":
        var dockerAnyCmd = require("./dockerAnyCmd");
        dockerAnyCmd.runCommand();
        break;
}