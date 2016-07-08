var BSplineInterpolation = function(dataPoints,
p,
parameterSelectionMethodName,
knotSelectionMethodName) {

    var n = dataPoints.length - 1;
    
    var parameters = parameterSelectionMethods.getParameters(dataPoints,parameterSelectionMethodName);
    var knots = knotVectorSelectionMethods.getKnots(dataPoints,p,n,parameters,knotSelectionMethodName);

    this.compute = function() {

        var N = computeN();
        var dX=[],dY=[];

        for (var i = 0; i <=n ; i++) {
            dX.push(dataPoints[i].x);
            dY.push(dataPoints[i].y);
        }

        var pX = math.lusolve(N, dX);
        var pY = math.lusolve(N, dY);

        var controlPoints = [];

        for (var j = 0; j <= n; j++) {
            controlPoints.push(new Point(pX[j][0],pY[j][0]));
        }

        return { cp: controlPoints, knots: knots, params : parameters };

    }

    function computeN() {

        var N = [];

        var basisFunction = new BasisFunction(knots);

        for (var i = 0; i <= n; i++) {

            N[i] = [];

            for (var j = 0; j <=n ; j++) {

                N[i].push(basisFunction.compute(parameters[i],j,p));
            }
        }

        return N;
    }
}