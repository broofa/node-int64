var assert = require('assert');
var Int64 = require('./Int64');

var args = [
  [0],                     '0000000000000000', 0,
  [1],                     '0000000000000001', 1,
  [-1],                    'ffffffffffffffff', -1,
  [1e18],                  '0de0b6b3a7640000', 1e18,
  ['0001234500654321'],    '0001234500654321',     0x1234500654321,
  ['0ff1234500654321'],    '0ff1234500654321',   0xff1234500654300, // Imprecise!
  [0xff12345, 0x654321],   '0ff1234500654321',   0xff1234500654300, // Imprecise!
  [0xfffaffff, 0xfffff700],'fffafffffffff700',    -0x5000000000900,
  [0xafffffff, 0xfffff700],'affffffffffff700', -0x5000000000000800, // Imprecise!
  ['0x0000123450654321'],  '0000123450654321',      0x123450654321,
  ['0xFFFFFFFFFFFFFFFF'],  'ffffffffffffffff', -1
];

// Test constructor argments

for (var i = 0; i < args.length; i += 3) {
  var a = args[i], octets = args[i+1], number = args[i+2];
  console.log('Testing ' + a.join(', '));
  // Create instance
  var x = new Int64();
  Int64.apply(x, a);

  assert.equal(x.toOctetString(), octets,
               'Constuctor with ' + args.join(', '));

  assert.equal(x.toNumber(true), number);
}

// Test buffer output

var intUnderTest = new Int64(0xfffaffff, 0xfffff700);
var expectedBuffer = new Buffer([0xff, 0xfa, 0xff, 0xff, 0xff, 0xff, 0xf7, 0x00]);
console.log('Testing '+intUnderTest.toOctetString()+' as Buffer');
assert.equal(intUnderTest.toBuffer().toString('hex'), expectedBuffer.toString('hex'));

var targetBuffer = new Buffer(8);
intUnderTest.copy(targetBuffer);
assert.equal(targetBuffer.toString('hex'), expectedBuffer.toString('hex'));

// Test construction from existing buffer with offset, and buffer outputs on same.

var sourceBuffer = new Buffer(16);
sourceBuffer.writeUInt32BE(0xfffaffff, 2);
sourceBuffer.writeUInt32BE(0xfffff700, 6);
intUnderTest = new Int64(sourceBuffer, 2);
assert.equal(intUnderTest.toBuffer().toString('hex'), expectedBuffer.toString('hex'));

targetBuffer = new Buffer(16);
intUnderTest.copy(targetBuffer, 4);
assert.equal(targetBuffer.slice(4, 12).toString('hex'), expectedBuffer.toString('hex'));

console.log(new Int64(new Buffer([0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0])).toBuffer());

console.log(new Int64(new Uint8Array([0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0])).toBuffer());
