JavaScript Numbers are represented as [IEEE 754 double-precision floats](http://steve.hollasch.net/cgindex/coding/ieeefloat.html).  This means they can only accurately represent integers in the range of -2^^53 &lt;= x &lt;= +2^^53.  For projects that need to work with 64-bit ints, such as [node-thrift](https://github.com/wadey/node-thrift), a convenient way of representing is needed.

Int64 attempts to fill that need.
