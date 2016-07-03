var BSplineLeastSquare = function(dataPoints,
p,
h,
parameterSelectionMethodName,
knotSelectionMethodName) {

    var n = dataPoints.length - 1;
    var parameters = getParameters(dataPoints,parameterSelectionMethodName)
    var knots = getKnots(dataPoints,p,h,parameters,knotSelectionMethodName)

    this.compute = function() {

        var Q = computeQ();
        var N = computeN();
        var NT = math.transpose(N);
        var NTN = math.multiply(NT, N);

        var qX = [];
        var qY = [];

        for (var i = 0; i < h-1; i++) {
            qX.push(Q[i].X);
            qY.push(Q[i].Y);
        }

        var pX = math.lusolve(NTN, qX);
        var pY = math.lusolve(NTN, qY);

        var controlPoints = [dataPoints[0]];

        for (var j = 0; j < h-1; j++) {
            controlPoints.push(new Point(pX[j][0],pY[j][0]));
        }

        controlPoints.push(dataPoints[n]);

        var error = computeErrors(controlPoints,knots,parameters);

        return { cp: controlPoints, knots: knots, params : parameters,error:error };

    }

    function computeErrors(controlPoints, knots, parameters) {

        var result = {
            distances: [],
            minDistance: 10000,
            maxDistance: 0,
            totalDistance: 0,
            totalLeastSquareDistance: 0
        };

        var algorithm = new CoxDeboorAlgorithm(controlPoints, knots, p + 1);

        for (var i = 1; i < parameters.length-1; i++) {

            var curvePoint = algorithm.compute(parameters[i]);
            var distance = math.distance({ pointOneX: curvePoint.X, pointOneY: curvePoint.Y },
                { pointTwoX: dataPoints[i].X, pointTwoY: dataPoints[i].Y });

            result.distances.push(distance);

            if (distance < result.minDistance)
                result.minDistance = distance;

            if (distance > result.maxDistance)
                result.maxDistance = distance;

            result.totalDistance += distance;

            result.totalLeastSquareDistance += math.square(distance);
        }

        return result;
    }

    function computeQ() {

        var Q = [];

        var basisFunction = new BasisFunction(knots);

        for (var i = 1; i < h; i++) {

            var sumX = 0;
            var sumY = 0;

            for (var k = 1; k < n; k++) {

                var basis = basisFunction.compute(parameters[k], i, p);
                var qK = computeqk(k);
                sumX +=  basis * qK.X;
                sumY += basis * qK.Y;
            }

            Q.push(new Point(sumX, sumY));
        }

        return Q;
    }

    function computeqk(k) {
        
        var basisFunction = new BasisFunction(knots);
        var basisZero = basisFunction.compute(parameters[k], 0, p);
        var basisH = basisFunction.compute(parameters[k], h, p);

        var x = dataPoints[k].X
            - basisZero * dataPoints[0].X - basisH * dataPoints[n].X;

        var y = dataPoints[k].Y
            - basisZero * dataPoints[0].Y - basisH * dataPoints[n].Y;

        return new Point(x, y);
    }

    function computeN() {

        var N = [];

        var basisFunction = new BasisFunction(knots);

        for (var i = 1; i < n; i++) {

            N[i-1] = [];

            for (var j = 1; j < h; j++) {

                N[i-1].push(basisFunction.compute(parameters[i],j,p));
            }
        }

        return N;
    }

    function getParameters(dataPoints,parameterSelectionMethodName) {
        
        if(parameterSelectionMethodName==='uniformly-spaced'){
            return uniformlySpacedMethod(dataPoints);
        }
        else if (parameterSelectionMethodName==='chord-length'){
            return chordLengthMethod(dataPoints);
        }
        else if (parameterSelectionMethodName==='centripetal'){
            return centripetalMethod(dataPoints,0.8);
        }   

    }

    function getKnots(dataPoints,p,h,parameters,knotSelectionMethodName) {
        
        if(knotSelectionMethodName==='uniformly-spaced'){
            return uniformlySpaced(p, h);
        }
        else if (knotSelectionMethodName==='deboor-average'){
            return deboorAverage(p,h,parameters); 
        }

    }
}