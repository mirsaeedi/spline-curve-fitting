var BSplineIterativeApproximationPlotter = function (results) {

    this.plot = function (divElementId) {

        var curve = {
            x: [],
            y: [],
            type: 'spline',
            name:'Error'
        };

        for (var i = 0; i < results.length; i++) {

            curve.x.push(results[i].cp.length);
            curve.y.push(results[i].error.maxDistance);
        }


        var data = [curve];

        Plotly.newPlot(divElementId, data);

    }

}