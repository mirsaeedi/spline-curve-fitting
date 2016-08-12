function gaussian(x, params) {
    
    C = params[0];
    A = params[1];
    mu = params[2];
    sig = params[3];

    return C + A * Math.exp(-(Math.pow(x - mu, 2)) / (2 * Math.pow(sig, 2)));
}