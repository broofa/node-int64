/**
* Support for handling 64-bit int numbers in Javascript (node.js)
*
* JS Numbers are IEEE-754 double-precision floats, which limits the range of
* integer values that can be accurately represented to +/- 2^^53.
*
* Int64 objects wrap a node Buffer that holds the 8-bytes of int64 data.  These
* objects operate directly on the buffer, which means that if they are created
* using an existing buffer, setting the value will modify the Buffer and
* vice-versa.
*/

// Useful masks and values for doing bit twiddling
var MASK31 =  0x7fffffff, VAL31 = 0x80000000;
var MASK32 =  0xffffffff, VAL32 = 0x100000000;

// Map for converting hex octets to strings
var _HEX = [];
for (var i = 0; i < 256; i++) _HEX[i] = (i > 0xF ? '' : '0') + i.toString(16);

//
// Int64
//

/**
* Constructor accepts the following arguments:
*
* new Int64(buffer[, offset=0]) - Existing Buffer with byte offset
* new Int64(string)             - Hex string (throws if n is outside int64 range)
* new Int64(number)             - Number (throws if n is outside int64 range)
* new Int64(hi, lo)             - Raw bits as two 32-bit values
*/
var Int64 = module.exports = function(a1, a2) {
  if (a1 instanceof Buffer) {
    this.buffer = a1;
    this.offset = a2 || 0;
  } else {
    this.buffer = this.buffer || new Buffer(8);
    this.offset = 0;
    this.setValue.apply(this, arguments);
  }
};


// Max integer value that JS can accurately represent
Int64.MAX_INT = Math.pow(2, 53);

// Min integer value that JS can accurately represent
Int64.MIN_INT = -Math.pow(2, 53);

Int64.prototype = {
  /**
  * Do in-place 2's compliment.  See
  * http://en.wikipedia.org/wiki/Two's_complement
  */
  _2scomp: function() {
    var b = this.buffer, o = this.offset, carry = 1;
    for (var i = o + 7; i >= o; i--) {
      var v = (b[i] ^ 0xff) + carry;
      b[i] = v & 0xff;
      carry = v >> 8;
    }
  },

  /**
  * Set the value:
  * new Int64(string) - A hexidecimal string
  * new Int64(number) - Number (throws if n is outside int64 range)
  * new Int64(hi, lo) - Raw bits as two 32-bit values
  */
  setValue: function(hi, lo) {
    var negate = false;
    if (arguments.length == 1) {
      if (typeof(hi) == 'number') {
        // Simplify bitfield retrieval by using abs() value.  We restore sign
        // later
        negate = hi < 0;
        hi = Math.abs(hi);
        lo = hi % VAL32;
        hi = hi / VAL32;
        if (hi > VAL32) throw RangeError(hi  + ' is outside Int64 range');
        hi = hi | 0;
    } else if (typeof(hi) == 'string') {
        hi = (hi + '').replace(/^0x/, '');
        lo = hi.substr(-8);
        hi = hi.length > 8 ? hi.substr(0, hi.length - 8) : '';
        hi = parseInt(hi, 16);
        lo = parseInt(lo, 16);
      } else {
        throw Error(hi + ' must be a Number or String');
      }
    }

    // TODO: Do we want to throw if hi/lo is outside int32 range here?

    // Copy bytes to buffer
    b = this.buffer;
    var o = this.offset;
    for (var i = 7; i >= 0; i--) {
      b[o+i] = lo & 0xff;
      lo = i == 4 ? hi : lo >>> 8;
    }

    // Restore sign of passed argument
    if (negate) this._2scomp();
  },

  /**
  * Return the approximate error involved in converting the current value to a
  * native JS number.  If > 0, the value is outside the range JS can represent
  * to integer precision.
  */
  error: function() {
    return Math.ceil(Math.abs(x) / Int64.MAX_INT) - 1;
  },

  /**
  * Convert to a JS Number.
  *
  * Be aware that if the returned value is outside the range ...
  *
  *     Int64.MIN_INT <= x <= Int64.MAX_INT
  *
  * ... it is unlikely to exactly represent the underlying 64-bit value.
  */
  valueOf: function() {
    var b = this.buffer, o = this.offset;
    var negate = b[0] & 0x80, x = 0, xx = 1;
    if (negate) this._2scomp();
    for (var i = o + 7; i >= o; i--) {
      var v = b[i] & (i == 0 ? 0x7f : 0xff);
      x += v*xx;
      xx *= 0x100;
    }
    if (negate) {
      x = -x;
      this._2scomp();
    }
    return x;
  },

  /**
  * Get value as a string of hex octets
  *
  * @param sep (String) string to join() with. Default=''
  */
  toString: function(sep) {
    var b = this.buffer, o = this.offset, s = ['0x'];
    for (var i = 0; i < 8; i++) {
      s.push(_HEX[this.buffer[o+i]]);
    }
    return s.join('');
  }
};

//
// Tests
//

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
  console.log('value: ' + x + ', string: ' + x.toString() + ', err: ' + x.accuracy());

  console.log('-----------');
}
