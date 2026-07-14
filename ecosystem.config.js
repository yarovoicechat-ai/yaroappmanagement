module.exports = {
  apps: [
    {
      name: 'meethi-management-panel',
      cwd: '/root/apps/app-admin',
      script: 'npm',
      args: 'start',
      env: {
        PORT: 5051,
        NODE_ENV: 'production'
      }
    }
  ]
}
