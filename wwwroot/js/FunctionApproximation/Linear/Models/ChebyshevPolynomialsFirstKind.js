var ChebyshevPolynomialsFirstKind = (function () {
    
    var self = {};

    self.compute = function (n,x) {
        
        if(n==0)
            return 1;

        if(n==1)
            return x;

        var k = n-1;

        return 2*x*ChebyshevPolynomialsFirstKind.compute(k,x)-ChebyshevPolynomialsFirstKind.compute(k-1,x);

    }

    return self;

})();