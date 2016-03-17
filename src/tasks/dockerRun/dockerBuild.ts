/// <reference path="../../../typings/vsts-task-lib/vsts-task-lib.d.ts" />

import fs = require("fs");
import path = require("path");
import tl = require("vsts-task-lib/task");
import * as docker from "./dockerCommand";

export function dockerBuild(): void {
    var dockerConnectionString = tl.getInput("dockerServiceEndpoint", true);
    var registryEndpoint = tl.getInput("dockerRegistryServiceEndpoint", true);
    var dockerFile = tl.getInput("dockerFile", true);
    var context = tl.getInput("context", true);
    var imageName = tl.getInput("imageName", true);
    var additionalArgs = tl.getInput("additionalArgs", false);

    var registryConnetionDetails = tl.getEndpointAuthorization(registryEndpoint, true);

    var loginCmd = new docker.DockerCommand("login");
    loginCmd.dockerConnectionString = dockerConnectionString;
    loginCmd.registryConnetionDetails = registryConnetionDetails;
    loginCmd.execSync();

    dockerFile = copyDockerFileToContextFolder(dockerFile, context);

    var cmd = new docker.DockerCommand("build");
    cmd.dockerConnectionString = dockerConnectionString;
    cmd.dockerFile = dockerFile;
    cmd.context = context;
    cmd.imageName = imageName;
    cmd.additionalArguments = additionalArgs;
    cmd.execSync();

    var logoutCmd = new docker.DockerCommand("logout");
    logoutCmd.dockerConnectionString = dockerConnectionString;
    logoutCmd.execSync();
}

function copyDockerFileToContextFolder(dockerFile: string, context: string): string {
    var target = path.join(context, path.basename(dockerFile));

    if (dockerFile == target) {
        return target;
    }

    fs.writeFileSync(target, fs.readFileSync(dockerFile));
    return target;
}