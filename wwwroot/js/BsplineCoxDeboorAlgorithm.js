var CoxDeboorAlgorithm = function(controlPoints, knots, bsplineOrder) {

    var memoization = null;

    this.compute = function(t) {

        var rangeIndex = findRangeIndex(t);

        memoization = [];

        for (var i = 0; i < bsplineOrder; i++) {
            memoization[i] = [];
            for (var j = 0; j < rangeIndex + 1; j++) {
                memoization[i][j] = null;
            }
        }

        return innerCompute(bsplineOrder - 1, rangeIndex, t);
    }

    var innerCompute = function(upIndex, downIndex, t) {

        if (upIndex === 0) {

            if (downIndex > -1 && downIndex < controlPoints.length)
                return controlPoints[downIndex];
            else
                return new Point(0, 0);

        }

        var cache = null;
        if ((cache = isValueComputedBefore(upIndex, downIndex)) != null)
            return cache;

        var proportion = getProportion(upIndex, downIndex, t);

        var first = innerCompute(upIndex - 1, downIndex - 1, t);
        var second = innerCompute(upIndex - 1, downIndex, t);

        var x = ((1 - proportion) * first.X) + (proportion * second.X);
        var y = ((1 - proportion) * first.Y) + (proportion * second.Y);

        var result = new Point(x, y);

        memoization[upIndex][downIndex] = result;

        return result;

    }

    var isValueComputedBefore = function(i, j) {
        return memoization[i][j];
    }

    var getProportion = function(j, i, t) {

        return (t - knots[i]) / (knots[i - j + bsplineOrder] - knots[i]);

    }

    var findRangeIndex = function(t) {

        for (var i = 1; i < knots.length; i++) {

            if (knots[i] > t)
                return i - 1;
        }
    }

}