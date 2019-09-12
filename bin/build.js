const fs = require('fs');
const babel = require('@babel/core');
const uglifyJs = require('uglify-js');
const uglifyEs = require('uglify-es');

const uglify = (/* string */ code, /* uglifyJs|uglifyEs */ minifier) => {
  let length = 0;
  do {
    length = code.length;
    code = minifier.minify(code, {
      compress: {
        passes: 1,
        unsafe_math: true,
        unsafe_proto: true,
      },
      mangle: {
        reserved: [
          'idrinth',
          'fabric',
        ],
        toplevel: true,
        properties: {
          regex: /^_/u,
          reserved: [ '_objects', ],
        },
      },
      output: {
        beautify: false,
      },
    }).code;
  } while (length > code.length);
  return code;
};
const write = (/* string */ code, /* string */ type) => fs.writeFileSync(
  `${ __dirname }/../dist/ifjss.${ type }.js`,
  code
);
const writeAsEs5 = (/* string */ code) => {
  code = babel.transform(
    code,
    {
      envName: 'production',
      sourceType: 'script',
      presets: [ [ '@babel/preset-env', ], ],
    }
  ).code;
  write(code, 'es5');
  write(uglify(code, uglifyJs), 'es5.min');
};
const writeAsEs6 = /* string */ code => {
  write(code, 'es6');
  write(uglify(code, uglifyEs), 'es6.min');
};
const replaceRequires = (/* string */ code) => {
  const includeRequire = (
    /* string */ source,
    /* object */ included,
    /* object */ replace
  ) => {
    const read = file => fs.readFileSync(file)+'';
    let result = `${ replace.declaration } ${ replace.var }`;
    if (included[replace.file]) {
      if (replace.var !== included[replace.file]) {
        return source.replace(
          replace.found,
          result+'=' + included[replace.file]+';'
        );
      }
      return source.replace(replace.found, '');
    }
    if (fs.existsSync(replace.file)) {
      const content = read(replace.file).split('module.exports');
      /* eslint-disable-next-line no-magic-numbers */
      if (content.length < 2) {
        content.unshift('');
      }
      included[replace.file] = replace.var;
      /* eslint-disable-next-line no-magic-numbers */
      result = content[0]+ result + content[1];
      return source.replace(replace.found, result);
    }
    return source.replace(replace.found, '');
  };
  const INCLUDE = (() => {
    const definers = [
      'var',
      'const',
      'let',
    ].join('|');
    const name = '([a-z0-9_A-Z]+?)';
    const include = 'require\\s*\\(\\s*\'(.+)\'\\s*\\)';
    return new RegExp(
      `(${ definers })\\s+${ name }\\s*=\\s*${ include }((\\.${ name })*);`,
      'u'
    );
  })();
  const included = {};
  while (code.match(INCLUDE)) {
    const matches = code.match(INCLUDE);
    code = includeRequire(
      code,
      included,
      /* eslint-disable no-magic-numbers */
      {
        found: matches[0],
        declaration: matches[1],
        var: matches[2],
        file: `${ __dirname }/../src/${ matches[3] }.js`,
        sub: matches[4],
      }
      /* eslint-enable no-magic-numbers */
    );
  }
  return code.replace(/class .+? ?\{/ug, 'class {');
};

(() => {
  let code = 'var FabricJsSerializer=require(\'index\');';
  code += 'return FabricJsSerializer;';
  code = `idrinth.FabricJsSerializer=(()=>{${ code }})();`;
  code = replaceRequires(`var idrinth=idrinth||{};${ code }`);
  writeAsEs5(code);
  writeAsEs6(code);
})();
