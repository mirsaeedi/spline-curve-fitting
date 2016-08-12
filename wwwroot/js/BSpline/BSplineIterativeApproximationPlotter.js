var BSplineIterativeApproximationPlotter = function (approximationResult) {

    this.plot = function (divElementId) {

        $('#' + divElementId).width($($('#' + divElementId)
            .parent()).width());

        var curve = {
            x: [],
            y: [],
            type: 'spline',
            name: 'Error'
        };

        for (var i = 0; i < approximationResult.approximations.length; i++) {

            curve.x.push(approximationResult.approximations[i].bspline.getControlPoints().length);
            curve.y.push(approximationResult.approximations[i].error.maxDistance);
        }

        var data = [curve];



        var layout = {
            title: 'Comparing Max Error Of Each Iteration',
            xaxis: {
                title: 'Number Of Control Points (Iteration)',
                titlefont: {
                    family: 'Courier New, monospace',
                    size: 18,
                    color: '#7f7f7f'
                }
            },
            yaxis: {
                title: 'Maximum Error',
                titlefont: {
                    family: 'Courier New, monospace',
                    size: 18,
                    color: '#7f7f7f'
                }
            }
        };

        Plotly.newPlot(divElementId, data,layout);

    }

}