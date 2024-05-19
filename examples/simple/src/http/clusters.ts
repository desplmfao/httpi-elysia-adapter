import { fork } from 'node:child_process';
import { cpus } from 'node:os';

import { default as env } from '@/env';

// Sets the worker file to worker.ts
const workerFile = 'src/http/listen.ts';

// When a child process exits, it creates a new one.
function onExit() {
   console.log(`The child died.`);
   createChildProcess();
}

// Spawn child processes.
const childProcessCount = env.WebsiteClusters || cpus().length;
for (let i = 0; i < childProcessCount; ++i) {
   createChildProcess();
}

/**
 * Create a child process
 */
function createChildProcess() {
   const child = fork(workerFile);
   console.log(`A child has spawned with PID ${child.pid}.`);

   // Listen for exit events
   child.on('exit', onExit);
}
