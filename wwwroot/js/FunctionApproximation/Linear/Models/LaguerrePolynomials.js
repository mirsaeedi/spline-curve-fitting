var LaguerrePolynomials = (function () {
    
    var self = {};

    self.compute = function (n,x) {
        
        if(n==0)
            return 1;

        if(n==1)
            return 1-x;

        var k = n-1;

        return (((2*k+1-x)*(LaguerrePolynomials.compute(k,x)))-(k*LaguerrePolynomials.compute(k-1,x)))/(k+1);

    }

    return self;

})();