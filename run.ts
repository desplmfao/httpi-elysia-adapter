import { $ } from 'bun';

const args = process.argv.slice(2);
const passthrough_index = args.indexOf('--');
const main_args =
   passthrough_index === -1 ? args : args.slice(0, passthrough_index);
const passthrough_args =
   passthrough_index === -1 ? [] : args.slice(passthrough_index + 1);

let cmd = '';
const env = {
   ...(process.env as Record<string, string>),
} as const;

const src_dir = 'src';
const bun_exe = 'bun';
const cwd = main_args[0];

const commands_action = {
   lint: `${bun_exe}x eslint "./**/*.ts"`,
   build: '',
   start: `${bun_exe} ${src_dir}/index.ts`,
} as const;

const commands_mode_start = {
   dev: `${bun_exe} --hot ${src_dir}/index.ts`,
} as const;

const commands_mode_build = {
   esm: `${bun_exe}x --${bun_exe} tsc --project tsconfig.esm.json`,
   cjs: `${bun_exe}x --${bun_exe} tsc --project tsconfig.cjs.json`,
} as const;

const action = main_args[1] as keyof typeof commands_action;
const mode = main_args[2] as
   | keyof typeof commands_mode_start
   | keyof typeof commands_mode_build;

let node_env: 'development' | 'production' | 'testing' = 'production';

void (async () => {
   switch (action) {
      case 'lint':
         cmd = commands_action.lint;

         break;

      case 'build':
         cmd = `${commands_mode_build.esm} && ${commands_mode_build.cjs}`;

         if (mode === 'esm') cmd = commands_mode_build.esm;
         if (mode === 'cjs') cmd = commands_mode_build.cjs;

         break;

      case 'start':
         cmd = mode === 'dev' ? commands_mode_start.dev : commands_action.start;

         if (mode === 'dev') {
            node_env = 'development';
         }

         break;
   }

   Object.assign(env, {
      NODE_ENV: node_env,
      BUN_GARBAGE_COLLECTOR_LEVEL: '1',
   } as const);

   $.cwd(cwd);
   $.env(env);

   const passthrough = passthrough_args.join(' ');

   console.log(cmd, passthrough);

   await $`${{ raw: cmd }} ${{ raw: passthrough }}`;
})();
