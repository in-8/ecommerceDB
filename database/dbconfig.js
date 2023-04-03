const sqlConfig = {
    user: process.env.adminUser,
    password: process.env.adminPassword,
    database:process.env.db ,
    server: 'localhost',
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    },
    options: {
      encrypt: true, // for azure
      trustServerCertificate: true // change to true for local dev / self-signed certs
    },
    port:50718,
  }

module.exports = sqlConfig