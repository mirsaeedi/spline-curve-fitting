var ChebyshevPolynomialsSecondKind = (function () {
    
    var self = {};

    self.compute = function (n,x) {
        
        if(n==0)
            return 1;

        if(n==1)
            return x;

        var k = n-1;

        return 2*x*ChebyshevPolynomialsSecondKind.compute(k,x)-ChebyshevPolynomialsSecondKind.compute(k-1,x);

    }

    return self;

})();

