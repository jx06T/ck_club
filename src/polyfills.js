if (typeof MessageChannel === 'undefined') {
  global.MessageChannel = require('worker_threads').MessageChannel;
}