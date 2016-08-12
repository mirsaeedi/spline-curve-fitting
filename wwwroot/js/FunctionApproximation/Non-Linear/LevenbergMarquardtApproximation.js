var LevenbergMarquardtApproximation = function(nonLinearModel,dataPoints){

    var self=this;

    self.approximate=function(parameters0){

        var xData=dataPoints.map(function(item){
            return item.x;
        });

        var yData=dataPoints.map(function(item){
            return item.y;
        });

        var fitobj  = jsfit.fit(nonLinearModel, [xData,yData], parameters0, {'debug': true });
        var nonlinearFunction = new NonLinearFunction(nonLinearModel,fitobj.params);
        return nonlinearFunction;
    }

}