var NonLinearFunction=function(nonLinearModel,parameters){

    var self=this;

    this.parameters = parameters;
    this.compute = function (x) {
        
        return nonLinearModel(x,parameters);
    }

    this.derivative = function(x){

        var delta=0.000001;
        var x1=x+delta;
        var x2=x;

        return (self.compute(x1)-self.compute(x2))/delta;

    }

}