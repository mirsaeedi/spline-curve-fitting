var PlotDrawer = function (divElementId,width,height) {

    $('#' + divElementId).height(height);
    $('#' + divElementId).width(width);

    var self = this;

    this.draw = function(curvePoints,xLayout,yLayout,controlPoints,dataPoints,noiseLessPoints) {
        
        var curve = {
            x: [],
            y: [],
            type: 'spline',
            name:'Curve'
        };

        for (var i = 0; i < curvePoints.length; i++) {

            curve.x.push(curvePoints[i].x);
            curve.y.push(curvePoints[i].y);
        }

        var cPoints = {
            x: [],
            y: [],
            mode: 'markers',
            name: 'ControlPoints'
        };

        if (controlPoints != null) {
        
            for (var i = 0; i < controlPoints.length; i++) {

                cPoints.x.push(controlPoints[i].x);
                cPoints.y.push(controlPoints[i].y);
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

                dPoints.x.push(dataPoints[i].x);
                dPoints.y.push(dataPoints[i].y);
            }

        }

        var nlPoints = {
            x: [],
            y: [],
            mode: 'markers',
            name: 'Noise Less Points'
        };

        if (noiseLessPoints != null && noiseLessPoints.length<dataPoints.length) {

            for (var i = 0; i < noiseLessPoints.length; i++) {

                nlPoints.x.push(noiseLessPoints[i].x);
                nlPoints.y.push(noiseLessPoints[i].y);
            }

        }

        var layout = {
            xaxis: xLayout,
            yaxis: yLayout
        };

        var data = [curve,cPoints,dPoints,nlPoints];

        Plotly.newPlot(divElementId, data, layout);

    }
}