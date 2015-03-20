/* Generated by Yosys 0.5 (git sha1 c3c9fbf, gcc 4.8.2-19ubuntu1 -O2 -fstack-protector -fPIC -Os) */

module simple(x, z);
  wire _0_;
  wire _1_;

  input [1:0] x;
  output [1:0] z;

  INVX1 _2_ (
    .A(x[0]),
    .Y(_0_)
  );
  NOR2X1 _3_ (
    .A(x[1]),
    .B(x[0]),
    .Y(_1_)
  );
  XOR2X1 _4_ (
    .A(_0_),
    .B(x[0]),
    .Y(z[0])
  );

  INVX1 _2_ (
    .A(_1_),
    .Y(z[1])
  );
  


endmodule
