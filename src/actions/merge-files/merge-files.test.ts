import { PassThrough } from "stream";
import { createJsonMergeFilesAction } from "./merge-files";
import { getVoidLogger } from "@backstage/backend-common";
import fs from "fs/promises";
import path from "path";

jest.mock("@backstage/plugin-scaffolder-backend", () => ({
  ...jest.requireActual("@backstage/plugin-scaffolder-backend"),
  executeShellCommand: jest.fn(),
}));

describe("json:merge", () => {
  beforeEach(async () => {
    await fs.mkdir(path.resolve(__dirname, "./test-files/results"));
  });

  afterEach(async () => {
    jest.resetAllMocks();
    await fs.rm(path.resolve(__dirname, "./test-files/results"), {
      recursive: true,
      force: true,
    });
  });

  it("should call action", async () => {
    const action = createJsonMergeFilesAction();

    const logger = getVoidLogger();

    const workspacePath = path.resolve(__dirname, "./test-files");

    await action.handler({
      input: {
        inputFiles: ["test-file-1.json", "test-file-2.json"],
        outputFileName: "result.json",
        outputFilePath: "results",
      },
      workspacePath,
      logger,
      logStream: new PassThrough(),
      output: jest.fn(),
      createTemporaryDirectory() {
        throw new Error("Not implemented");
      },
    });

    const file = await fs.readFile(`${workspacePath}/results/result.json`);
    const jsonResult = file.toJSON();

    expect(jsonResult).not.toBeFalsy();
  });
});
