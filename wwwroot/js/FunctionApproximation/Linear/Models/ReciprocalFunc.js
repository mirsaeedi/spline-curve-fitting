var ReciprocalFunc = (function () {
    
    var self = {};

    self.compute = function (n,x) {
        
        if(n==0)
            return 1;

        return 1/Math.pow(x,n);
    }

    return self;

})();