var parameterSelectionMethods = function () {

    var self={};

    self.getParameters=function(dataPoints,p,h,parameterSelectionMethodName) {
        
        if(parameterSelectionMethodName==='uniformly-spaced'){
            return parameterSelectionMethods.uniformlySpacedMethod(dataPoints);
        }
        else if (parameterSelectionMethodName==='chord-length'){
            return parameterSelectionMethods.chordLengthMethod(dataPoints);
        }
        else if (parameterSelectionMethodName==='x-length'){
            return parameterSelectionMethods.xLengthMethod(dataPoints);
        }
        else if (parameterSelectionMethodName==='centripetal'){
            return parameterSelectionMethods.centripetalMethod(dataPoints,0.5);
        }   
        else if (parameterSelectionMethodName==='universal'){
            return parameterSelectionMethods.universalMethod(dataPoints,p,h);
        }   
    }

    self.universalMethod= function(dataPoints,p,h){

        var parameters = [];
        var knots = knotVectorSelectionMethods.uniformlySpaced(p,h);

        var basisFunction = new BasisFunction(knots);
        var value=0;

        for(var i=0;i<dataPoints.length;i++){

            var max = -1;

            for(var t=0;t<=1;t+=1/100){
                value=basisFunction.compute(t,i,p);
                if(value>max){
                    max=value;
                    parameters[i]=t;        
                }
            }
        }

        return {knots:knots,parameters:parameters};

    }

    self.uniformlySpacedMethod = function (dataPoints) {

        var parameters = [];
        var n = dataPoints.length - 1;

        for (var i = 0; i <= n; i++) {

            parameters.push(i / n);

        }

        return parameters;

    }

    self.chordLengthMethod = function (dataPoints) {

        var parameters = [0];

        var totalLength = math.bignumber(0);
        var l = [];

        for (var k = 0; k < dataPoints.length - 1; k++) {

            var distanceK = math.
                distance(
                { pointOneX:  math.bignumber(dataPoints[k].x), pointOneY:  math.bignumber(dataPoints[k].y) },
                { pointTwoX:  math.bignumber(dataPoints[k + 1].x), pointTwoY:  math.bignumber(dataPoints[k + 1].y) });

                totalLength = totalLength.plus(math.bignumber( distanceK));
                l.push(totalLength);
        }

        for (var k = 0; k < dataPoints.length - 1; k++) {
            parameters.push(l[k].div(totalLength));
        }

        return parameters;

    }

     self.xLengthMethod = function (dataPoints) {

        var parameters = [0];

        var totalLength = 0;
        var l = [];

        for (var k = 0; k < dataPoints.length - 1; k++) {

            var distanceK = dataPoints[k + 1].x - dataPoints[k].x;
            totalLength += distanceK;
            l.push(totalLength);
        }

        for (var k = 0; k < dataPoints.length - 1; k++) {
            parameters.push(l[k] / totalLength);
        }

        parameters.push(1);

        return parameters;

    }


    self.centripetalMethod = function (dataPoints, a) {

        var parameters = [0];

        var n = dataPoints.length - 1;
        var totalLength = 0;
        var l = [];

        parameters[0] = 0;

        for (var k = 1; k <= n; k++) {

            var length = math.
                distance(
                { pointOneX: dataPoints[k].x, pointOneY: dataPoints[k].y },
                { pointTwoX: dataPoints[k - 1].x, pointTwoY: dataPoints[k - 1].y });

            var distanceK = math.pow(length, a);

            totalLength += distanceK;
            l.push(totalLength);
        }

        for (var k = 0; k < n; k++) {
            parameters.push(l[k] / totalLength);
        }

        parameters[n] = 1;

        return parameters;

    }

    return self;

}();

