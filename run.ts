import { $ } from 'bun';

const args = process.argv.slice(2);
const passthrough_index = args.indexOf('--');
const main_args = passthrough_index === -1 ? args : args.slice(0, passthrough_index);
const passthrough_args = passthrough_index === -1 ? [] : args.slice(passthrough_index + 1);

let cmd = '';
const env = {
   ...(process.env as Record<string, string>),
} as const;

const targets = ['cjs', 'esm'] as const;

export type Target = (typeof targets)[number];

const commands_action = {
   lint: `bunx eslint "./**/*.ts"`,
   build: 'bunx --bun tsc --project tsconfig.esm.json',
   start: 'bun src/index.ts',
} as const;

const commands_mode_start = {
   dev: 'bun --hot src/index.ts',
} as const;

const commands_mode_build = {
   esm: commands_action['build'],
   cjs: 'bunx --bun tsc --project tsconfig.esm.json',
} as const;

const [cwd, action, mode] = main_args as [
   string,
   keyof typeof commands_action,
   keyof typeof commands_mode_start | keyof typeof commands_mode_build,
];

let node_env: 'development' | 'production' | 'testing' = 'production';

(async () => {
   if (!(action && Object.keys(commands_action).indexOf(action) > -1)) {
      return;
   }

   switch (action) {
      case 'lint':
         cmd = commands_action.lint;

         break;

      case 'build':
         if (!(targets.indexOf(main_args[2] as Target) > -1))
            throw new Error(
               `${main_args[2]} is not a valid target. \nchoose once from:\n${targets.join(', ')}`,
            );

         switch (mode) {
            case 'cjs':
               cmd = commands_mode_build.cjs;
               break;

            default:
               cmd = commands_mode_build.esm;
               break;
         }

         break;

      case 'start':
         switch (mode) {
            case 'dev':
               cmd = commands_mode_start.dev;
               node_env = 'development';
               break;

            default:
               cmd = commands_action.start;
               break;
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

   await $`${{ raw: cmd }} ${{ raw: passthrough }}`;
})();
