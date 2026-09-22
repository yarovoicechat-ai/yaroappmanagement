module.exports = {
  apps: [
    {
      name: 'yaro-management',
      cwd: '/root/apps/app-management',
      script: 'npm',
      args: 'start',
      env: {
        PORT: 3102,
        NODE_ENV: 'production'
      }
    }
  ]
}

