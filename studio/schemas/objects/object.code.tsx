import { defineType } from 'sanity';

import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/mode-dockerfile';
import 'ace-builds/src-noconflict/mode-gcode';
import 'ace-builds/src-noconflict/mode-golang';
import 'ace-builds/src-noconflict/mode-graphqlschema';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-json5';
import 'ace-builds/src-noconflict/mode-jsx';
import 'ace-builds/src-noconflict/mode-markdown';
import 'ace-builds/src-noconflict/mode-plain_text';
import 'ace-builds/src-noconflict/mode-prisma';
import 'ace-builds/src-noconflict/mode-rust';
import 'ace-builds/src-noconflict/mode-text';
import 'ace-builds/src-noconflict/mode-toml';
import 'ace-builds/src-noconflict/mode-tsx';
import 'ace-builds/src-noconflict/mode-typescript';
import 'ace-builds/src-noconflict/mode-yaml';

export default defineType({
  title: 'Code',
  name: 'object.code',
  type: 'code',
  options: {
    withFilename: true,
    theme: 'github',
    darkTheme: 'github',
    language: 'javascript',
    languageAlternatives: [
      { title: 'CSS', value: 'css', mode: 'css' },
      { title: 'Dockerfile', value: 'Dockerfile', mode: 'dockerfile' },
      { title: 'gcode', value: 'gcode', mode: 'gcode' },
      { title: 'golang', value: 'golang', mode: 'golang' },
      { title: 'GraphQL', value: 'graphql', mode: 'graphqlschema' },
      { title: 'HTML', value: 'html', mode: 'html' },
      { title: 'Javascript', value: 'javascript', mode: 'javascript' },
      { title: 'Json', value: 'json', mode: 'json' },
      { title: 'Json5', value: 'json5', mode: 'json5' },
      { title: 'JSX', value: 'jsx', mode: 'jsx' },
      { title: 'Markdown', value: 'md', mode: 'markdown' },
      { title: 'Plain Text', value: 'text', mode: 'plain-text' },
      { title: 'Prisma', value: 'prisma', mode: 'prisma' },
      { title: 'Rust', value: 'rust', mode: 'rust' },
      { title: 'Text', value: 'txt', mode: 'text' },
      { title: 'Toml', value: 'toml', mode: 'toml' },
      { title: 'Typescript', value: 'ts', mode: 'typescript' },
      { title: 'TSX', value: 'tsx', mode: 'TSX' },
      { title: 'Yaml', value: 'yml', mode: 'yaml' },
    ],
  },
});
