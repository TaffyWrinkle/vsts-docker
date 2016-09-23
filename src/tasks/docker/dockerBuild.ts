"use strict";

import * as path from "path";
import * as tl from "vsts-task-lib/task";
import DockerConnection from "./dockerConnection";
import * as gitUtils from "./gitUtils";
import * as imageUtils from "./dockerImageUtils";

export function run(connection: DockerConnection): any {
    var command = connection.createCommand();
    command.arg("build");

    var dockerFile = tl.globFirst(tl.getInput("dockerFile", true));
    command.arg(["-f", dockerFile]);

    var buildArguments = tl.getDelimitedInput("buildArguments", "\n");
    if (buildArguments) {
        buildArguments.forEach(buildArgument => {
            command.arg(["--build-arg", buildArgument]);
        });
    }

    var imageName = tl.getInput("imageName", true);
    command.arg(["-t", imageName]);
    var baseImageName = imageUtils.imageNameWithoutTag(imageName);
    var additionalImageTags = tl.getDelimitedInput("additionalImageTags", "\n");
    if (additionalImageTags) {
        additionalImageTags.forEach(tag => {
            command.arg(["-t", baseImageName + ":" + tag]);
        });
    }
    var includeGitTags = tl.getBoolInput("includeGitTags");
    if (includeGitTags) {
        var sourceVersion = tl.getVariable("Build.SourceVersion");
        if (!sourceVersion) {
            throw new Error("Cannot retrieve git tags because Build.SourceVersion is not set.");
        }
        var tags = gitUtils.tagsAt(sourceVersion);
        tags.forEach(tag => {
            command.arg(["-t", baseImageName + ":" + tag]);
        });
    }
    var includeLatestTag = tl.getBoolInput("includeLatestTag");
    if (baseImageName !== imageName && includeLatestTag) {
        command.arg(["-t", baseImageName]);
    }

    var context: string;
    if (!tl.filePathSupplied("context")) {
        context = path.dirname(dockerFile);
    } else {
        context = tl.getPathInput("buildContext");
    }
    command.arg(context, true);

    return command.exec();
}
