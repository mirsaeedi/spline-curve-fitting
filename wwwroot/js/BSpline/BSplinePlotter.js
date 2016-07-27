var BSplinePlotter = function (bspline, dataPoints, noiseLessPoints,approximationResult) {

    this.plot = function () {

        plotCurve();

        if(approximationResult){
            plotError();
        }
    }

    var plotError = function () {

        var plotDrawer = new PlotDrawer('error-canvas', $($('#error-canvas')
            .parent()).width());

        var curve = {
            x: [],
            y: [],
            type: 'spline',
            name:'Error'
        };

        for (var i = 0; i < dataPoints.length; i++) {

            curve.x.push(i+1);
            curve.y.push(approximationResult.error.distances[i]);

        }

        var data = [curve];
        Plotly.newPlot('error-canvas', data);

    }

    var plotCurve = function () {

        var plotDrawer = new PlotDrawer('plotly-canvas', $($('#plotly-canvas')
            .parent()).width(), $(window).height() * 1.5);

        var curvePoints = [];

        curvePoints.push(dataPoints[0]);
        for (var i = dataPoints[1].x; i < dataPoints[dataPoints.length-1].x; i+=0.1) {

            var t = bspline.mapXToParameter(i);

            if(t){
                var point = bspline.deboorEvaluation(t);
                curvePoints.push(point);
            }
            else{
                console.log(i);
            }

        }
        curvePoints.push(dataPoints[dataPoints.length-1]);

        /*
        for (var i = 0; i < 1; i += 0.001) {

            var point = bspline.deboorEvaluation(i);
            curvePoints.push(point);

        }*/

        plotDrawer.draw(curvePoints,
            {},
            {},
            bspline.getControlPoints(),
            dataPoints,
            noiseLessPoints);

    }
}