var BSplineIterativeApproximationPlotter = function (approximationResult) {

    this.plot = function (divElementId) {

        $('#' + divElementId).width($($('#' + divElementId)
        .parent()).width());

        var curve = {
            x: [],
            y: [],
            type: 'spline',
            name:'Error'
        };

        for (var i = 0; i < approximationResult.approximations.length; i++) {

            curve.x.push(approximationResult.approximations[i].bspline.getControlPoints().length);
            curve.y.push(approximationResult.approximations[i].error.maxDistance);
        }

        var data = [curve];

        Plotly.newPlot(divElementId, data);

    }

}