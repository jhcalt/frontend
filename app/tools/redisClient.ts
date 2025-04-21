import Redis from 'ioredis';

const isServer = typeof process !== 'undefined' && 
                process.versions != null && 
                process.versions.node != null;

if (!isServer) {
  throw new Error('Redis operations should only be performed on the server side');
}

export const redis = new Redis({
  host: 'dev.quantumsenses.com', // your Redis host
  // host: 'jdl.atsgps.in',
  port: 6379, // your Redis port
  password: 'hjdyufgjahgIUGSYDFSJGG', // your Redis password
});
