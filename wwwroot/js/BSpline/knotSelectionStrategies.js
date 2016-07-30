var KnotSelectionStrategies = (function () {

    var self = {};

    self.UniformlySpacedStrategy = function () {

        this.getKnots = function (p, h, parameters) {

            var n = h;

            var knots = [];

            for (var i = 0; i < p + 1; i++) {
                knots.push(0);
            }

            for (var i = 1; i <= n - p; i++) {
                knots.push(i / (n - p + 1));
            }

            for (var i = 0; i < p + 1; i++) {
                knots.push(1);
            }

            return knots;
        }

    }

    self.DeboorAverageApproximationStrategy = function (fittingMode) {

        this.getKnots = function (p, h, parameters) {

            var knots = [];

            var n = parameters.length - 1;

            for (var i = 0; i < p + 1; i++) {
                knots.push(0);
            }

            if (fittingMode == 'interpolation') {

                for (var j = 1; j <= h - p; j++) {
                    var sum = 0;
                    for (var i = j; i <= j + p - 1; i++) {
                        sum += parameters[i];
                    }
                    knots.push(sum / p);
                }
            } else if (fittingMode == 'approximation') {

                var d = (n + 1) / (h - p + 1);

                for (var i = 1; i <= h - p; i++) {

                    var j = parseInt(i * d);
                    var alpha = i * d - j;

                    knots.push(parameters[j - 1] + alpha * (parameters[j] - parameters[j - 1]));
                }
            }

            for (var i = 0; i < p + 1; i++) {
                knots.push(1);
            }

            return knots;
        }

    }

    return self;

})();
