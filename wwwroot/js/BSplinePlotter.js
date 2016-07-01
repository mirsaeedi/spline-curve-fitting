var BSplinePlotter = function(controlPoints,knots,p,dataPoints) {
    
    var bsplineOrder = p + 1;

    var algorithm = new CoxDeboorAlgorithm(controlPoints, knots, bsplineOrder);

    this.plot= function() {
     
        var plotDrawer = new PlotDrawer('plotly-canvas', $($('#plotly-canvas').parent()).width() - 100, $(window).height() - 100);

        var curvePoints = [];

        for (var i = 0; i < 1; i += 0.001) {

            var point = algorithm.compute(i);
            curvePoints.push(point);

        }

        plotDrawer.draw(curvePoints,
        { range: [-20, 20], dtick: 1 },
        { range: [-20, 20], dtick: 1 },
        controlPoints,
        dataPoints);

    }
}