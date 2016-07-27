var BSpline = function (order, controlPoints, knots) {

    var self = this;
    var basisFunctions = null;
    var xFunctions = null;
    var yFunctions = null;

    this.getControlPoints = function () {
        return controlPoints;
    };

    this.getKnots = function () {
        return knots;
    };

    this.getOrder = function () {
        return order;
    };

    this.deboorEvaluation = function (t) {
        return deboorAlgorithm(t);
    }

    this.getBasisFunctions = function () {

        if (basisFunctions)
            return basisFunctions;

        var p = order;
        var functions = [];

        for (var k = p; k < knots.length - p - 1; k++) {

            var N = [];

            for (var i = 0; i < controlPoints.length; i++)
                N[i] = new algebra.Expression(0);

            N[k] = new algebra.Expression(1);

            for (var d = 1; d <= p; d++) {

                N[k - d] = new algebra.parse('(' + knots[k + 1] + '- t ) / (' + (knots[k + 1] - knots[k - d + 1]) + ')').multiply(N[k - d + 1]);
                N[k - d] = N[k - d].simplify();

                for (var i = k - d + 1; i <= k - 1; i++) {

                    var temp1 = new algebra.parse('( t - ' + knots[i] + ' ) / (' + (knots[i + d] - knots[i]) + ')').multiply(N[i]);
                    var temp2 = new algebra.parse('(' + knots[i + d + 1] + '- t ) / (' + (knots[i + d + 1] - knots[i + 1]) + ')').multiply(N[i + 1]);

                    N[i] = temp1.simplify().add(temp2.simplify());
                }

                N[k] = new algebra.parse('( t - ' + knots[k] + ' ) / (' + (knots[k + d] - knots[k]) + ')').multiply(N[k]);
                N[k] = N[k].simplify();

            }

            functions.push({ knotspan: k, basisFunctions: N });
        }

        basisFunctions = functions;

        return functions;

    }

    this.getXFunctions = function () {

        if (xFunctions)
            return xFunctions;


        xFunctions = computePolynomials(function (i) {
            return controlPoints[i].x
        });

        return xFunctions;

    }

    this.getYFunctions = function () {

        if (yFunctions)
            return yFunctions;

        yFunctions = computePolynomials(function (i) {
            return controlPoints[i].y
        });

        return yFunctions;
    }

    this.mapXToParameter = function (x) {

        if (!xFunctions)
            self.getXFunctions();

        for (var i = 0; i < xFunctions.length; i++) {
            if (x <= xFunctions[i].lastValue) {

                var equation = new algebra.Equation(xFunctions[i].func, new algebra.Fraction(parseInt(x * 100000000), 100000000));
                var newLhs = equation.lhs.copy();
                newLhs = newLhs.subtract(equation.rhs);

                var answers = nerdamer.solveEquations(equation.toString(),'t');
                 for (var j = 0; j < answers.length; j++) {

                    if(answers[j]==undefined)
                        break;
                        
                    var answer =  parseFloat(nerdamer(answers[j].toString(),{}, 'numer').text());
                    if (knots[xFunctions[i].knotspan] <= answer && answer <= knots[xFunctions[i].knotspan + 1]) {
                        return answer;
                    }
                }

                /*
                var answers = solveCubic(newLhs._cubicCoefficients().a ? newLhs._cubicCoefficients().a.valueOf() : 0,
                    newLhs._cubicCoefficients().b.valueOf() ? newLhs._cubicCoefficients().b.valueOf() : 0,
                    newLhs._cubicCoefficients().c.valueOf() ? newLhs._cubicCoefficients().c.valueOf() : 0,
                    newLhs._cubicCoefficients().d.valueOf() ? newLhs._cubicCoefficients().d.valueOf() : 0);


                for (var j = 0; j < answers.length; j++) {

                    var answer =  parseFloat(answers[j].valueOf().toFixed(6));

                    if (knots[xFunctions[i].knotspan] <= answer && answer <= knots[xFunctions[i].knotspan + 1]) {
                        return answer;
                    }
                }*/
            }
        }

    }

    var computePolynomials = function (mapper) {

        if (!basisFunctions)
            self.getBasisFunctions();


        var p = order;
        var functions = [];

        for (var k = p; k < knots.length - p - 1; k++) {

            var basisFuncs = basisFunctions[k - p].basisFunctions;

            var func = new algebra.Expression(0);

            for (var i = 0; i < controlPoints.length; i++) {

                var exp = basisFuncs[i].multiply(new algebra.Fraction(parseInt(mapper(i) * 100000000), 100000000));
                func = func.add(exp);
                func = func.simplify();

            }

            var lastValue = func.eval({ t: new algebra.Fraction(parseInt(knots[k + 1] * 100000000), 100000000) })
            var lastValue = lastValue.constants[0].valueOf();

            functions.push({ knotspan: k, func: func, lastValue: lastValue });

        }

        return functions;
    }


    var deboorAlgorithm = function (t) {

        var indexOfRange = findRangeIndex(t);

        var d = [];

        for (var i = 0; i <= order; i++) {

            var downIndex = indexOfRange - order + i;

            if (downIndex > -1 && downIndex < controlPoints.length)
                d.push(controlPoints[downIndex]);
            else
                d.push(new Point(0, 0));
        }


        for (var r = 1; r <= order; r++) {

            for (var i = indexOfRange - order + r; i <= indexOfRange; i++) {

                var alpha = (t - knots[i]) / (knots[i + order - r + 1] - knots[i])

                var x = d[i - (indexOfRange - order + r)].x * (1 - alpha)
                    + d[i - (indexOfRange - order + r) + 1].x * alpha;

                var y = d[i - (indexOfRange - order + r)].y * (1 - alpha)
                    + d[i - (indexOfRange - order + r) + 1].y * alpha;

                d[i - (indexOfRange - order + r)] = new Point(x, y);
            }
        }

        return d[0];
    }


    var findRangeIndex = function (t) {

        for (var i = 0; i < knots.length; i++) {

            if (knots[i] > t)
                return i - 1;

            if(t==1 && knots[i+1]==1)
                return i;
        }
    }

    function cuberoot(x) {
        var y = Math.pow(Math.abs(x), 1 / 3);
        return x < 0 ? -y : y;
    }

    function solveCubic(a, b, c, d) {
        if (Math.abs(a) < 1e-8) { // Quadratic case, ax^2+bx+c=0
            a = b; b = c; c = d;
            if (Math.abs(a) < 1e-8) { // Linear case, ax+b=0
                a = b; b = c;
                if (Math.abs(a) < 1e-8) // Degenerate case
                    return [];
                return [-b / a];
            }

            var D = b * b - 4 * a * c;
            if (Math.abs(D) < 1e-8)
                return [-b / (2 * a)];
            else if (D > 0)
                return [(-b + Math.sqrt(D)) / (2 * a), (-b - Math.sqrt(D)) / (2 * a)];
            return [];
        }

        // Convert to depressed cubic t^3+pt+q = 0 (subst x = t - b/3a)
        var p = (3 * a * c - b * b) / (3 * a * a);
        var q = (2 * b * b * b - 9 * a * b * c + 27 * a * a * d) / (27 * a * a * a);
        var roots;

        if (Math.abs(p) < 1e-8) { // p = 0 -> t^3 = -q -> t = -q^1/3
            roots = [cuberoot(-q)];
        } else if (Math.abs(q) < 1e-8) { // q = 0 -> t^3 + pt = 0 -> t(t^2+p)=0
            roots = [0].concat(p < 0 ? [Math.sqrt(-p), -Math.sqrt(-p)] : []);
        } else {
            var D = q * q / 4 + p * p * p / 27;
            if (Math.abs(D) < 1e-8) {       // D = 0 -> two roots
                roots = [-1.5 * q / p, 3 * q / p];
            } else if (D > 0) {             // Only one real root
                var u = cuberoot(-q / 2 - Math.sqrt(D));
                roots = [u - p / (3 * u)];
            } else {                        // D < 0, three roots, but needs to use complex numbers/trigonometric solution
                var u = 2 * Math.sqrt(-p / 3);
                var t = Math.acos(3 * q / p / u) / 3;  // D < 0 implies p < 0 and acos argument in [-1..1]
                var k = 2 * Math.PI / 3;
                roots = [u * Math.cos(t), u * Math.cos(t - k), u * Math.cos(t - 2 * k)];
            }
        }

        // Convert back from depressed cubic
        for (var i = 0; i < roots.length; i++)
            roots[i] -= b / (3 * a);

        return roots;
    }

    return self;

};