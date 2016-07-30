var BezierPlotter = function(controlPoints) {
    
    this.plot= function() {
     
        var plotDrawer = new PlotDrawer('plotly-canvas', $($('#plotly-canvas').parent()).width(), $(window).height() *1.5);

        var bezier = new Bezier(controlPoints);

        var curvePoints = [];

        for (var i = 0; i < 1; i += 0.001) {

            var point = bezier.compute(i);
            curvePoints.push(point);

        }

        plotDrawer.draw(curvePoints,
        { },
        { },
        controlPoints);

    }
}