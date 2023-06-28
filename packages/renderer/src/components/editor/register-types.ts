import { languages } from 'monaco-editor';

const modules = import.meta.glob('../../../../../node_modules/@jscad/modeling/src/**/*.d.ts', { as: 'raw', eager: true });

languages.typescript.typescriptDefaults.setCompilerOptions({
  moduleResolution: languages.typescript.ModuleResolutionKind.NodeJs,
  typeRoots: ['file:///global.d.ts'],
});

Object.keys(modules).forEach((key) => {
  const filePath = 'file:///node_modules/@jscad/modeling/' + key.replace('../../../../../node_modules/@jscad/modeling/src/', '');
  languages.typescript.typescriptDefaults.addExtraLib(
    modules[key],
    filePath,
  );
  languages.typescript.javascriptDefaults.addExtraLib(
    modules[key],
    filePath,
  );
});

const globalModule = `
import * as _jsCad from "@jscad/modeling";

declare global {
  type jsCad = typeof _jsCad;

  var jscadModeling: jsCad;

  var colors = jsCad.colors;
  var curves = jsCad.curves;
  var geometries = jsCad.geometries;
  var maths = jsCad.maths;
  var measurements = jsCad.measurements;
  var primitives = jsCad.primitives;
  var text = jsCad.text;
  var utils = jsCad.utils;

  var booleans = jsCad.booleans;
  var expansions = jsCad.expansions;
  var extrusions = jsCad.extrusions;
  var hulls = jsCad.hulls;
  var modifiers = jsCad.modifiers;
  var transforms = jsCad.transforms;
}
`;

languages.typescript.typescriptDefaults.addExtraLib(globalModule, 'file:///global.d.ts');
