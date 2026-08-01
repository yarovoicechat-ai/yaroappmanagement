module.exports = {
  apps: [
    {
      name: 'app-management',
      cwd: '/root/apps/app-management',
      script: 'npm',
      args: 'start',
      env: {
        PORT: 3003,
        NODE_ENV: 'production'
      }
    }
  ]
}

