import { createTemplateAction } from "@backstage/plugin-scaffolder-backend";
import * as jsonMerger from "json-merger";
import fsPromises from "fs/promises";
import ensureDirectoryExists from "../../helpers/ensureDirectoryExists";

export function createJsonMergeFileAction() {
  return createTemplateAction<{
    inputFile: string;
    outputFileName: string;
    outputFilePath?: string;
    jsonMergeOptions?: object;
  }>({
    id: "json:merge-file",
    description: "Merges two or more files",
    supportsDryRun: true,
    schema: {
      input: {
        type: "object",
        required: ["inputFile", "outputFileName"],
        properties: {
          inputFile: {
            title: "Input file",
            description: "The file in the working directory to merge",
            type: "string",
          },
          outputFileName: {
            title: "Output file name",
            description: "The name of the file to write to",
            type: "string",
          },
          outputFilePath: {
            title: "Output file path",
            description:
              "The path to output the file to. Defaults to the task's working directory",
            type: "string",
          },
          jsonMergeOptions: {
            title: "Json merge options",
            description: "Options to pass to the JSON mergeFiles function",
            type: "object",
          },
        },
      },
    },
    async handler(ctx) {
      try {
        console.log(`Running json merge in ${ctx.workspacePath}`);
        ctx.logger.info(`Running json merge in ${ctx.workspacePath}`);

        const config = {
          ...ctx.input.jsonMergeOptions,
          cwd: ctx.workspacePath,
        };

        ctx.logger.info(`input file: ${ctx.input.inputFile}`);

        const result = jsonMerger.mergeFile(ctx.input.inputFile, config);

        const outputPathAndFile = `${ctx.workspacePath}/${
          ctx.input.outputFilePath ?? ""
        }/${ctx.input.outputFileName}`.replace("//", "/");

        if (ctx.input.outputFilePath) {
          await ensureDirectoryExists(
            `${ctx.workspacePath}/${ctx.input.outputFilePath}`
          );
        }

        const resultJson = JSON.stringify(result, null, 2);

        ctx.logger.info(
          `Writing result to output with filePath ${ctx.workspacePath}/${ctx.input.outputFilePath}`
        );
        ctx.logger.info(`Result: ${resultJson}`);

        await fsPromises.writeFile(outputPathAndFile, resultJson);
      } catch (err) {
        console.error(err);
        ctx.logger.error(err);
        throw err;
      }
    },
  });
}
