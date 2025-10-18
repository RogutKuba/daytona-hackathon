module.exports = {
  apps: [
    {
      name: 'daytona-api',
      cwd: '/Users/kubarogut/Documents/Projects/daytona-hacksprint/api',
      script: 'bun',
      args: 'run src/index.ts',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
    {
      name: 'daytona-web',
      cwd: '/Users/kubarogut/Documents/Projects/daytona-hacksprint/web',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
