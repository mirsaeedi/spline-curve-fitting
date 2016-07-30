var BSplineBuilder = (function () {

    var self = {};

    self.build = function (order, controlPoints, knots) {
        return new BSpline(order, controlPoints, knots);
    };

    self.interpolate = function (dataPoints, order, fittingStrategy) {

        var parameters = fittingStrategy.getParameters(dataPoints, 0.5,order);
        var knots = fittingStrategy.getKnots(order, dataPoints.length - 1, parameters);
        return Interpolator.interpolate(dataPoints, order, parameters, knots);

    };

    self.approximate = function (dataPoints, order, numberOfControlPoints, fittingStrategy) {

        var h = numberOfControlPoints - 1;
        var parameters = fittingStrategy.getParameters(dataPoints, 0.5,order);
        var knots = fittingStrategy.getKnots(order, h, parameters);
        return Approximator.approximate(dataPoints, order, h, parameters, knots);
    };


    self.iterativeAproximate = function (dataPoints, order,
        numberOfControlPoints, fittingStrategy, iterativeApproximationStrategy) {

        return IterativeApproximator.approximate(dataPoints, order, numberOfControlPoints - 1,
            fittingStrategy, iterativeApproximationStrategy);
    };

    var Interpolator = (function (params) {

        var self = {};

        self.interpolate = function (dataPoints, p, parameters, knots) {

            var n = dataPoints.length - 1;
            var N = computeN(n, p, parameters, knots);
            var dX = [], dY = [];

            for (var i = 0; i <= n; i++) {
                dX.push(dataPoints[i].x);
                dY.push(dataPoints[i].y);
            }

            var pX = math.lusolve(N, dX);
            var pY = math.lusolve(N, dY);

            var controlPoints = [];

            for (var j = 0; j <= n; j++) {
                controlPoints.push(new Point(pX[j][0], pY[j][0]));
            }

            var bspline = BSplineBuilder.build(p, controlPoints, knots);

            return { bspline: bspline, params: parameters };

        }

        function computeN(n, p, parameters, knots) {

            var N = [];

            var basisFunction = new BasisFunction(knots);

            for (var i = 0; i <= n; i++) {

                N[i] = [];

                for (var j = 0; j <= n; j++) {

                    N[i].push(basisFunction.compute(parameters[i], j, p));
                }
            }

            return N;
        }

        return self;

    })();

    var Approximator = (function () {

        var self = {};

        self.approximate = function (dataPoints, p, h, parameters, knots) {

            var n = dataPoints.length - 1;
            var Q = computeQ(dataPoints, n, p, h, parameters, knots);
            var N = computeN(n, p, h, parameters, knots);

            var NT = math.transpose(N);
            var NTN = math.multiply(NT, N);

            var qX = [];
            var qY = [];

            for (var i = 0; i < h - 1; i++) {
                qX.push(Q[i].x);
                qY.push(Q[i].y);
            }

            var pX = null;
            var pY = null;

            try {

                pX = math.lusolve(NTN, qX);
                pY = math.lusolve(NTN, qY);
            }
            catch (e) {
                return { cp: [], knots: [], params: [], error: "singular matrix", order: p };
            }

            var controlPoints = [dataPoints[0]];

            for (var j = 0; j < h - 1; j++) {
                controlPoints.push(new Point(pX[j][0], pY[j][0]));
            }

            controlPoints.push(dataPoints[n]);

            var bspline = BSplineBuilder.build(p, controlPoints, knots);

            var error = computeErrors(bspline, dataPoints, parameters);

            return { bspline: bspline, params: parameters, error: error };
        }

        function computeErrors(bspline, dataPoints, parameters) {

            var result = {
                distances: [],
                minDistance: 10000,
                maxDistance: 0,
                totalDistance: 0,
                totalLeastSquareDistance: 0
            };

            for (var i = 1; i < parameters.length - 1; i++) {

                var curvePoint = bspline.deboorEvaluation(parameters[i]);

                var distance = math.distance({ pointOneX: curvePoint.x, pointOneY: curvePoint.y },
                    { pointTwoX: dataPoints[i].x, pointTwoY: dataPoints[i].y });

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

        function computeQ(dataPoints, n, p, h, parameters, knots) {

            var Q = [];

            var basisFunction = new BasisFunction(knots);

            for (var i = 1; i < h; i++) {

                var sumX = 0;
                var sumY = 0;

                for (var k = 1; k < n; k++) {

                    var basis = basisFunction.compute(parameters[k], i, p);
                    var qK = computeqk(k, dataPoints, n, p, h, parameters, knots);
                    sumX += basis * qK.x;
                    sumY += basis * qK.y;
                }

                Q.push(new Point(sumX, sumY));
            }

            return Q;
        }

        function computeqk(k, dataPoints, n, p, h, parameters, knots) {

            var basisFunction = new BasisFunction(knots);
            var basisZero = basisFunction.compute(parameters[k], 0, p);
            var basisH = basisFunction.compute(parameters[k], h, p);

            var x = dataPoints[k].x
                - basisZero * dataPoints[0].x - basisH * dataPoints[n].x;

            var y = dataPoints[k].y
                - basisZero * dataPoints[0].y - basisH * dataPoints[n].y;

            return new Point(x, y);
        }

        function computeN(n, p, h, parameters, knots) {

            var N = [];

            var basisFunction = new BasisFunction(knots);

            for (var i = 1; i < n; i++) {

                N[i - 1] = [];

                for (var j = 1; j < h; j++) {

                    N[i - 1].push(basisFunction.compute(parameters[i], j, p));
                }
            }

            return N;
        }

        return self;

    })();

    var IterativeApproximator = (function () {

        var self = {};

        self.approximate = function (dataPoints, p, h, fittingStrategy, iterativeApproximationStrategy) {

            if (iterativeApproximationStrategy.getEndConditionType() == 'error-bounded') {

                return iterate(dataPoints, p, h, fittingStrategy, iterativeApproximationStrategy,
                    function (i, distance) {
                        return distance > iterativeApproximationStrategy.getEndConditionValue();
                    });
            }
            if (iterativeApproximationStrategy.getEndConditionType() == 'iteration-bounded') {

                return iterate(dataPoints, p, h, fittingStrategy, iterativeApproximationStrategy,
                    function (i, distance) {
                        return i <= iterativeApproximationStrategy.getEndConditionValue();
                    });

            }

        }

        var iterate = function (dataPoints, p, h, fittingStrategy, iterativeApproximationStrategy, iterateCondition) {

            var result = { approximations: [], bestApproximation: null };

            var n = dataPoints.length - 1;

            for (var i = iterativeApproximationStrategy.getInitialNumberOfControlPoints(); i <= n; i++) {

                var approximation = BSplineBuilder
                    .approximate(dataPoints, p, i - 1, fittingStrategy);

                if (approximation.error == "singular matrix")
                    continue;

                result.approximations.push(approximation);

                if (result.bestApproximation == null)
                    result.bestApproximation = approximation;
                else if (result.bestApproximation.error.maxDistance > approximation.error.maxDistance)
                    result.bestApproximation = approximation;

                if (!iterateCondition(i, approximation.error.maxDistance))
                    return result;
            }

            return result;

        }

        return self;

    })();

    return self;

})()