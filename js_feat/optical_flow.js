console.log("init");

var columns = 90, rows = 6540, data_type = jsfeat.U8_t | jsfeat.C1_t;
var my_matrix = new jsfeat.matrix_t(columns, rows, data_type);

console.log("matrix: " + my_matrix.cols + ", " + my_matrix.rows);