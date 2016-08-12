var LinearPlotter = function (linearFunction, dataPoints) {

    this.plot = function () {

        plotCurve();
    }

    var plotError = function () {

        var plotDrawer = new PlotDrawer('error-canvas', $($('#error-canvas')
            .parent()).width());

        var curve = {
            x: [],
            y: [],
            type: 'spline',
            name: 'Error'
        };

        for (var i = 0; i < dataPoints.length; i++) {

            curve.x.push(i + 1);
            curve.y.push(approximationResult.error.distances[i]);

        }

        var layout = {
            title: 'Curve Error (Point By Point)',
            xaxis: {
                title: 'Index Of Data Point',
                titlefont: {
                    family: 'Courier New, monospace',
                    size: 18,
                    color: '#7f7f7f'
                }
            },
            yaxis: {
                title: 'Error',
                titlefont: {
                    family: 'Courier New, monospace',
                    size: 18,
                    color: '#7f7f7f'
                }
            }
        };

        var data = [curve];
        Plotly.newPlot('error-canvas', data, layout);

    }

    var plotCurve = function () {

        var plotDrawer = new PlotDrawer('plotly-canvas', $($('#plotly-canvas')
            .parent()).width(), $(window).height() * 1.5);

        var curvePoints = [];

        for (var x = dataPoints[0].x; x <= dataPoints[dataPoints.length - 1].x; x += 0.1) {

            var y = linearFunction.compute(x);
            curvePoints.push(new Point(x,y));
        }

        plotDrawer.draw(curvePoints,
            {},
            {},
            null,
            dataPoints,
            null);

    }
}