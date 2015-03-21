module booth_encoder(a, b);
	input a;
	output b;
	wire [3:0] w;
	INVX1 g0 (
        .A(a),
        .Y(w[0])
    );
    OR2X1 g1 (
        .A(w[0]),
        .B(w[3]),
        .Y(w[1])
    );
    OR2X1 g2 (
        .A(w[1]),
		.B(w[3]),
        .Y(w[2])
    );
    INVX1 g3 (
        .A(w[2]),
        .Y(w[3])
    );
	INVX1 g4 (
        .A(w[3]),
        .Y(b)
    );
endmodule
