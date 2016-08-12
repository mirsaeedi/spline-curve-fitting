var LinearFunction = function(basisFunctions,parameters) {

    var self=this;
    this.parameters = parameters;
    this.order=parameters.length - 1;

    this.compute = function (x) {
        
        var result = 0;

        for (var i = 0; i <= self.order; i++) {
            result+=parameters[i]*basisFunctions.compute(i,x);
        }

        return result;
    }

    this.derivative = function(x){

        var delta=0.000001;
        var x1=x+delta;
        var x2=x;

        return (self.compute(x1)-self.compute(x2))/delta;

    }
}