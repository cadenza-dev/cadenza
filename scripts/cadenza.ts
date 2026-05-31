import { pathToFileURL } from "node:url";
import { runCadenzaCliEntrypoint } from "../packages/cli/src/index.ts";

if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  runCadenzaCliEntrypoint(process.argv.slice(2)).then((exitCode) => {
    process.exitCode = exitCode;
  });
}
