function exponential(x, parameters) {

    var C = params[0],
        A = params[1],
        k = params[2];
        
    return (C + A * Math.exp(-k * x));

}