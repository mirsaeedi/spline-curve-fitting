var RamerDouglasPeuckerAlgorithm = function () {


    function distanceOfPointFromLine(p, p1, p2) {

        var x = p1.x,
            y = p1.y,
            dx = p2.x - x,
            dy = p2.y - y;

        if (dx !== 0 || dy !== 0) {

            var t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);

            if (t > 1) {
                x = p2.x;
                y = p2.y;

            } else if (t > 0) {
                x += dx * t;
                y += dy * t;
            }
        }

        dx = p.x - x;
        dy = p.y - y;

        return dx * dx + dy * dy;
    }

    function recursiveDouglasPeucker(points, first, last, tolerance, result) {

        var maxDistance = tolerance,
            index;

        for (var i = first + 1; i < last; i++) {

            var distance = distanceOfPointFromLine(points[i], points[first], points[last]);

            if (distance > maxDistance) {
                index = i;
                maxDistance = distance;
            }
        }

        if (maxDistance > tolerance) {

            if (index - first > 1)
                recursiveDouglasPeucker(points, first, index, tolerance, result);

            result.push(points[index]);

            if (last - index > 1)
                recursiveDouglasPeucker(points, index, last, tolerance, result);
        }
    }

    function douglasPeucker(points, tolerance) {

        var last = points.length - 1;

        var result = [points[0]];

        recursiveDouglasPeucker(points, 0, last, tolerance, result);

        result.push(points[last]);

        return result;
    }

    this.compute = function (points, tolerance) {

        if (points.length <= 2) return points;

        var tolerance = tolerance !== undefined ? tolerance * tolerance : 1;

        points = douglasPeucker(points, tolerance);

        return points;
    };


};