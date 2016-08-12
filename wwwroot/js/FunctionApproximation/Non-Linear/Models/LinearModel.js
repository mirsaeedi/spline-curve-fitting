function LinearModel(x, parameters) {

  var A=parameters[0];
  var B=parameters[1];

  var y = A*x + B;
  return y;
}