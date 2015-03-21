module booth_encoder(a, b);
    input [15:0] a;
    output b;
    wire [18:0] w;
    AND2X1 g0 (
        .A(a[0]),
        .B(a[1]),
        .Y(w[0])
    );
    AND2X1 g1 (
        .A(a[2]),
        .B(a[3]),
        .Y(w[1])
    );
    OR2X1 g2 (
        .A(w[10]),
        .B(a[5]),
        .Y(w[2])
    );
    INVX1 g3 (
        .A(a[6]),
        .Y(w[3])
    );
    AND2X1 g4 (
        .A(a[7]),
        .B(a[8]),
        .Y(w[4])
    );
    OR2X1 g5 (
        .A(w[0]),
        .B(w[1]),
        .Y(w[5])
    );
    INVX1 g6 (
        .A(w[2]),
        .Y(w[6])
    );
    INVX1 g7 (
        .A(w[4]),
        .Y(w[7])
    );
    NOR2X1 g8 (
        .A(a[10]),
        .B(a[11]),
        .Y(w[8])
    );
    XOR2X1 g9 (
        .A(a[12]),
        .B(a[13]),
        .Y(w[9])
    );
    AND2X1 g10 (
        .A(w[5]),
        .B(w[6]),
        .Y(w[10])
    );    
    OR2X1 g11 (
        .A(a[14]),
        .B(a[15]),
        .Y(w[11])
    );
    AND2X1 g12 (
        .A(w[7]),
        .B(a[9]),
        .Y(w[12])
    );
    AND2X1 g13 (
        .A(w[10]),
        .B(w[3]),
        .Y(w[13])
    );
    OR2X1 g14 (
        .A(w[8]),
        .B(w[9]),
        .Y(w[14])
    );
    NAND2X1 g15 (
        .A(w[13]),
        .B(w[11]),
        .Y(w[15])
    );
    OR2X1 g16 (
        .A(w[7]),
        .B(w[12]),
        .Y(w[16])
    );
    AND2X1 g17 (
        .A(w[14]),
        .B(w[15]),
        .Y(w[17])
    );
    INVX1 g18 (
        .A(w[16]),
        .Y(w[18])
    );
    OR2X1 g19 (
        .A(w[17]),
        .B(w[18]),
        .Y(b)
    );
endmodule
