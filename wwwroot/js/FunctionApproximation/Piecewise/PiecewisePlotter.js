var PiecewisePlotter = function (segments, dataPoints) {

    this.plot = function () {

        plotCurve();
        plotError();
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

        var pointIndex = 0;
        for(var i=0;i<segments.length;i++){    
            for(var j=0;j<segments[i].points.length;j++){

                    y=segments[i].func.compute(segments[i].points[j].x);
                    curve.x.push(++pointIndex);
                    curve.y.push(Math.abs(segments[i].points[j].y - y));
            }
        }

        var layout = {
            title: 'Residuals',
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

        for(var i=0;i<segments.length;i++){

            for(var x=segments[i].points[0].x;x<=segments[i].points[segments[i].points.length-1].x;x+=0.01){

                    y=segments[i].func.compute(x);
                    curvePoints.push(new Point(x,y));
            }

            if(segments[i].transient){

                for(var x=segments[i].transient.firstX;x<=segments[i].transient.secondX;x+=0.001){

                    y=segments[i].transient.func.compute(x);
                    curvePoints.push(new Point(x,y));
                }
            }
        }

        plotDrawer.draw(curvePoints,
            {},
            {},
            null,
            dataPoints,
            null);

    }
}