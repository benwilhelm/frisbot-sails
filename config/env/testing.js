module.exports = {
  environment: 'testing',
  port: 1338,
  models: {
    connection: 'localDiskDb',
    migrate: 'drop'
  }
}