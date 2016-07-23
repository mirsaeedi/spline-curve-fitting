var BSplineIterativeApproximation = function (dataPoints,
p,
parameterSelectionMethodName,
knotSelectionMethodName,
initialNumberOfControlPoints,
useKnotHueristics) {

    var self=this;

    this.results = [];

    this.compute = function (endConditionType,endConditionValue) {

        var n = dataPoints.length-1;

        var bestResult=null;

        if(endConditionType=='errorBounded'){

            var maxError=endConditionValue;
            
            for (var i = initialNumberOfControlPoints; i < n ; i++){

                var approximator = new BSplineLeastSquareApproximation(dataPoints,
                    p,
                    i - 1,
                    parameterSelectionMethodName,
                    knotSelectionMethodName);

                    var result = approximator.compute();

                    if(result.error=="singular matrix")
                        continue;

                    self.results.push(result);
                        
                    if(result.error.maxDistance<=maxError)
                        return result;
                    else{
                        if(bestResult==null){
                            bestResult=result;
                        }else{
                            if(bestResult.error.maxDistance>result.error.maxDistance)
                                bestResult=result;
                        }
                    }

            }

            return bestResult;

        }
        else if(endConditionType=='iterationBounded'){

            var maxNumberOfControlPoints = endConditionValue;

            for (var i = initialNumberOfControlPoints; i <= maxNumberOfControlPoints && i < n; i++) {

                var approximator = new BSplineLeastSquareApproximation(dataPoints,
                    p,
                    i - 1,
                    parameterSelectionMethodName,
                    knotSelectionMethodName);

                var result = approximator.compute();

                self.results.push(result);

                if (bestResult == null) {
                    bestResult = result;
                } else {
                    if (bestResult.error.maxDistance > result.error.maxDistance)
                        bestResult = result;
                }

            }

            return bestResult;

        }

    }

}