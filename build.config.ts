import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    "./src/index",
    {
      builder: "mkdist",
      input: "./src/themes/",
      outDir: "./dist/themes",
    },
  ],
  declaration: true,
});
