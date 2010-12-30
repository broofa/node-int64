var Int64 = require('./Int64');

var args = [
  [0],
  [1],
  [-1],
  [1e18],
  ['0ff1234500654321'],
  [0xff12345, 0x654321],
  ['0x0001234500654321'],
  ['0xFFFFFFFFFFFFFFFF']
];

for (var i = 0; i < args.length; i++) {
  var a = args[i];
  // Create instance
  var x = new Int64();
  Int64.apply(x, a);

  console.log('  args: ' + a);
  console.log('value: ' + x + ', string: ' + x.toString() + ', err: ' + x.error());

  console.log('-----------');
}
