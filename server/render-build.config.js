module.exports = {
  // Configure build settings for Render
  rootDir: 'server',
  buildDir: 'public',
  clientDir: '../client',
  buildCommand: 'npm install && node build-client.js',
  startCommand: 'npm start'
};
