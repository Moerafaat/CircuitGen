`timescale 1ns/10ps
`celldefine
module NAND2X1 (A, B, Y);
input  A ;
input  B ;
output Y ;

   //nand(Y, A, B);
   //and (I0_out, A, B);
   //not (Y, I0_out);
  and (I0_out, A, B);
  not (I0_out2, I0_out);
  and(Y, A, I0_out2);

   specify
     // delay parameters
     specparam
       tplhl$A$Y = 0.051:0.051:0.051,
       tphlh$A$Y = 0.084:0.084:0.084,
       tplhl$B$Y = 0.051:0.051:0.051,
       tphlh$B$Y = 0.069:0.069:0.069;

     // path delays
     (A *> Y) = (tphlh$A$Y, tplhl$A$Y);
     (B *> Y) = (tphlh$B$Y, tplhl$B$Y);

   endspecify

endmodule
`endcelldefine
