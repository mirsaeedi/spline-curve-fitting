
var ParameterSelectionStrategies = (function () {

    var self = {};

    self.ChordLengthStrategy = function () {

        this.getParameters = function (dataPoints) {

            var parameters = [0];

            var totalLength = 0;
            var l = [];

            for (var k = 0; k < dataPoints.length - 1; k++) {

                var distanceK = math.
                    distance(
                    { pointOneX: dataPoints[k].x, pointOneY: dataPoints[k].y },
                    { pointTwoX: dataPoints[k + 1].x, pointTwoY: dataPoints[k + 1].y });

                totalLength += distanceK;
                l.push(totalLength);
            }

            for (var k = 0; k < dataPoints.length - 1; k++) {
                parameters.push(l[k] / totalLength);
            }

            return parameters;

        }
    }

    self.CentripetalStrategy = function () {

        this.getParameters = function (dataPoints, a,p) {

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
    }

    self.XLengthStrategy = function () {

        this.getParameters = function (dataPoints) {
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

            return parameters;
        }

    }

    self.UniformlySpacedStrategy = function () {

        this.getParameters = function (dataPoints,a,p) {

            var parameters = [];
            var n = dataPoints.length - 1;

            for (var i = 0; i <= n; i++) {

                parameters.push(i / n);
            }

            return parameters;

        }

    }

    self.UniversalStrategy = function () {

        var knots = null;
        var self=this;

        this.getKnots = function (p, h) {

            if(!knots){
                knots = new KnotSelectionStrategies
                .UniformlySpacedStrategy()
                .getKnots(p,h);
            }

            return knots;
        }

        this.getParameters = function (dataPoints,a, p) {

            var parameters = [0];

            knots = self.getKnots(p, dataPoints.length - 1);

            var basisFunction = new BasisFunction(knots);
            var value = 0;

            for (var i = 1; i < dataPoints.length-1; i++) {

                var max = -1;

                for (var t = 0; t <= 1; t += 0.01) {
                    value = basisFunction.compute(t, i, p);
                    if (value > max) {
                        max = value;
                        parameters[i] = t;
                    }
                }
            }

            parameters.push(1);

            return parameters;
        }
    }

    return self;

})();

