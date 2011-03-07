var Int64 = require('./Int64');

var args = [
  [0],                     '0000000000000000',
  [1],                     '0000000000000001',
  [-1],                    'ffffffffffffffff',
  [1e18],                  '0de0b6b3a7640000',
  ['0ff1234500654321'],    '0ff1234500654321',
  [0xff12345, 0x654321],   '0ff1234500654321',
  ['0x0000123450654321'],  '0000123450654321',
  ['0xFFFFFFFFFFFFFFFF'],  'ffffffffffffffff'
];

for (var i = 0; i < args.length; i += 2) {
  var a = args[i], octets = args[i+1];
  // Create instance
  var x = new Int64();
  Int64.apply(x, a);

  console.log('new Int64(' + a + ')');
  var pass = x.toOctetString() == octets;
  console.log((pass ? 'PASS' : 'FAIL') + ' - value:' + x +
              ', octets: ' + x.toOctetString());

  console.log('-----------');
}
