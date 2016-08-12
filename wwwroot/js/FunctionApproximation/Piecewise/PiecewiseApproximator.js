var PiecewiseApproximator = function (segments, dataPoints) {

    var self = this;

    self.approximate = function () {

        for (var i = 0; i < segments.length; i++) {

            var points = [];

            for (var j = segments[i].firstPointIndex; j <= segments[i].lastPointIndex; j++) {
                points.push(dataPoints[j]);
            }

            if (segments[i].approximationType == 'linear') {
                var approximator = new LeastSquareApproximation(segments[i].model, segments[i].order, points);
                var linearFunction = approximator.approximate();
                segments[i].func = linearFunction;
            }
            else if (segments[i].approximationType == 'nonlinear') {
                var approximator = new LevenbergMarquardtApproximation(segments[i].model, points);
                var nonlinearFunction = approximator.approximate(segments[i].parameters);
                segments[i].func = nonlinearFunction;
            }

            segments[i].points = points;
        }

        for (var i = 0; i < segments.length - 1; i++) {

            var firstX = dataPoints[segments[i].lastPointIndex].x;
            var firstPoint = new Point(firstX, segments[i].func.compute(firstX));
            var firstDerivative = segments[i].func.derivative(firstX);

            var secondX = dataPoints[segments[i + 1].firstPointIndex].x;
            var secondPoint = new Point(secondX, segments[i + 1].func.compute(secondX));
            var secondDerivative = segments[i+1].func.derivative(secondX);

            var matrix = [
                [1,firstX,math.pow(firstX, 2),math.pow(firstX, 3)],
                [1,secondX,math.pow(secondX, 2),math.pow(secondX, 3)],
                [0,1,2 * math.pow(firstX, 1),3 * math.pow(firstX, 2)],
                [0,1,2 * math.pow(secondX, 1),3 * math.pow(secondX, 2)],
            ]

            var values = [firstPoint.y, secondPoint.y, firstDerivative, secondDerivative]
            var coefficients = math.lusolve(matrix, values);

            for (var j = 0; j < coefficients.length; j++) {
                coefficients[j] = coefficients[j][0];
            }

            segments[i].transient = {
                firstX: firstX,
                secondX: secondX,
                func: new LinearFunction(MonomialFunc, coefficients)
            };
        }

        var errorResult = computeError(segments,dataPoints);

        return {
            segments:segments,
            error:errorResult
        };

    }


    var computeError = function (segments, dataPoints) {

        var result = {
            distances: [],
            minDistance: 1000000,
            maxDistance: 0,
            avgDistance:0
        };

        var pointIndex = 0;

        for (var i = 0; i < segments.length; i++) {
            for (var j = 0; j < segments[i].points.length; j++) {

                y = segments[i].func.compute(segments[i].points[j].x);
                var distance=Math.abs(segments[i].points[j].y - y);

                if(distance>result.maxDistance)
                    result.maxDistance=distance;
                if(distance<result.minDistance)
                    result.minDistance=distance;
                
                result.distances.push(distance);
                result.avgDistance+=distance;
                
            }
        }

        result.avgDistance=result.avgDistance/dataPoints.length;

        return result;
    }
}