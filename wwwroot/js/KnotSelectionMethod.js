var uniformlySpaced = function(p,n) {

    var knots = [];

    for (var i = 0; i < p+1; i++) {
        knots.push(0);
    }

    for (var i = 1; i <= n-p; i++) {
        knots.push(i/(n-p+1));
    }

    for (var i = 0; i < p + 1; i++) {
        knots.push(1);
    }

    return knots;

}