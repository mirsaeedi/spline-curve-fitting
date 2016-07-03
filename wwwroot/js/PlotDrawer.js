var PlotDrawer = function (divElementId,width,height) {

    $('#' + divElementId).height(height);
    $('#' + divElementId).width(width);

    var self = this;

    this.draw = function(curvePoints,xLayout,yLayout,controlPoints,dataPoints) {
        
        var curve = {
            x: [],
            y: [],
            type: 'spline',
            name:'Curve'
        };

        for (var i = 0; i < curvePoints.length; i++) {

            curve.x.push(curvePoints[i].X);
            curve.y.push(curvePoints[i].Y);
        }

        var cPoints = {
            x: [],
            y: [],
            mode: 'markers',
            name: 'ControlPoints'
        };

        if (controlPoints != null) {
        
            for (var i = 0; i < controlPoints.length; i++) {

                cPoints.x.push(controlPoints[i].X);
                cPoints.y.push(controlPoints[i].Y);
            }

        }

        var dPoints = {
            x: [],
            y: [],
            mode: 'markers',
            name: 'Data Points'
        };

        if (dataPoints != null) {

            for (var i = 0; i < dataPoints.length; i++) {

                dPoints.x.push(dataPoints[i].X);
                dPoints.y.push(dataPoints[i].Y);
            }

        }



        var layout = {
            xaxis: xLayout,
            yaxis: yLayout
        };

        var data = [curve,cPoints,dPoints];

        Plotly.newPlot(divElementId, data, layout);

    }
}