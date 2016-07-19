var controlPanelViewModel = {
    spline: ko.observable('bspline'),
    algrothim: ko.observable(),
    order: ko.observable(3),
    fittingMode: ko.observable('approximation'),
    parameterSelection: ko.observable(1),
    knotSelection: ko.observable(1),
    numberOfControlPoints: ko.observable(5),
    errorLimit: ko.observable(),
    tolerance: ko.observable(),
    noiseReductionAlgorithm: ko.observable(),
    file: ko.observable(),
    approximationType: ko.observable('non-iterative'),
    approximationSettings: {
        initialNumberOfControlPoints: ko.observable(5),
        approximationEndCondition: ko.observable('iterationBounded'),
        errorBound: ko.observable(0.5),
        maxNumberOfControlPoints: ko.observable(100),
        useKnotHueristics: ko.observable(false),
    },
    plot: function () {
        
        /*
        var floors = [1,4,8,-10,13,20,-8,18,3,-19,9]

        var dataPoint = [];
        var selectedFloor=0;
        var countOfSelectedFoor=5;

        for (var i = -10; i < 10; i += 0.1) {

            if(countOfSelectedFoor==5){
                countOfSelectedFoor=0;
                selectedFloor=Math.floor((Math.random() * floors.length));
            }

            dataPoint.push(new Point(i, selectedFloor+(Math.random()*4-2)));
            countOfSelectedFoor++;
        }

        plot({ dataPoints: dataPoint });

        
        var dataPoint = [];
        for (var i = -10; i < 10; i += 0.01) {
            //dataPoint.push(new Point(i,Math.sin(i)));
            dataPoint.push(new Point(i, Math.sin(i) * i));
            //dataPoint.push(new Point(i,i*i + 3*i + math.sin(i)));
        }

        plot({ dataPoints: dataPoint });*/

        InputReader.read($('#file')[0].files[0], plot);
    }
}

var resultViewModel = {
    numberOfKnots: ko.observable(),
    numberOfControlPoints: ko.observable(),
    numberOfDataPoints: ko.observable(),
    minDistance: ko.observable(),
    maxDistance: ko.observable(),
    avgDistance: ko.observable(),
    numberOfFunctions: ko.observable(),
    totalLeastSquareDistance: ko.observable()
}

ko.applyBindings(controlPanelViewModel, document.getElementById('controlPanel'));
ko.applyBindings(resultViewModel, document.getElementById('resultPanel'));

function plot(jsonInput) {

    $('#result-canvas').hide();
    var dataPoints = reduceNoise(jsonInput);

    if (controlPanelViewModel.spline() == 'bspline') {

        if (controlPanelViewModel.fittingMode() == 'approximation') {
            if (controlPanelViewModel.approximationType() == 'non-iterative')
                nonIterativeBSplineApproximation(jsonInput,dataPoints);
            else if (controlPanelViewModel.approximationType() == 'iterative')
                iterativeBSplineApproximation(jsonInput,dataPoints);
        }
        else if (controlPanelViewModel.fittingMode() == 'interpolation')
            bsplineInterpolation(jsonInput,dataPoints);
        else if (controlPanelViewModel.fittingMode() == 'controlPoints')
            bsplineControlPoints(jsonInput);

    }
    else if (controlPanelViewModel.spline() == 'bezier') {

        if (controlPanelViewModel.fittingMode() == 'controlPoints')
            bezierControlPoints(jsonInput);
    }
}

function reduceNoise(jsonInput) {

    if (controlPanelViewModel.noiseReductionAlgorithm() == 1) {

        var ramerDouglasPeuckerAlgorithm = new RamerDouglasPeuckerAlgorithm();
        return ramerDouglasPeuckerAlgorithm
            .compute(jsonInput.dataPoints, controlPanelViewModel.tolerance());

    }
    else {
        return jsonInput.dataPoints;
    }
}

function bezierControlPoints(jsonInput) {

    var plotter = new BezierPlotter(jsonInput.controlPoints);
    plotter.plot();
}

function bsplineControlPoints(jsonInput) {
    var plotter = new BSplinePlotter(jsonInput.controlPoints,
        jsonInput.knots,
        jsonInput.order);

    plotter.plot();
}

function bsplineInterpolation(jsonInput,dataPoints) {

    var interpolator = new BSplineInterpolation(dataPoints,
        parseInt(controlPanelViewModel.order()),
        controlPanelViewModel.parameterSelection(),
        controlPanelViewModel.knotSelection());

    var result = interpolator.compute();

    setResultPanel(result);

    var plotter = new BSplinePlotter(result.cp,
        result.knots,
        parseInt(controlPanelViewModel.order()),
        jsonInput.dataPoints,
        dataPoints);

    plotter.plot();
}

function nonIterativeBSplineApproximation(jsonInput,dataPoints) {

    var approximator = new BSplineLeastSquareApproximation(dataPoints,
        parseInt(controlPanelViewModel.order()),
        parseInt(controlPanelViewModel.numberOfControlPoints()) - 1,
        controlPanelViewModel.parameterSelection(),
        controlPanelViewModel.knotSelection());

    var result = approximator.compute();

    setResultPanel(result);

    var plotter = new BSplinePlotter(result.cp,
        result.knots,
        parseInt(controlPanelViewModel.order()),
        jsonInput.dataPoints,
        dataPoints);

    plotter.plot();

}

function iterativeBSplineApproximation(jsonInput,dataPoints) {

    var approximator = new BSplineIterativeApproximation(dataPoints,
        parseInt(controlPanelViewModel.order()),
        controlPanelViewModel.parameterSelection(),
        controlPanelViewModel.knotSelection(),
        parseInt(controlPanelViewModel.approximationSettings.initialNumberOfControlPoints()));

    var endConditionValue = null;
    if (controlPanelViewModel.approximationSettings.approximationEndCondition() == 'errorBounded') {
        endConditionValue = parseFloat(controlPanelViewModel.approximationSettings.errorBound());
    } else {
        endConditionValue = parseInt(controlPanelViewModel.approximationSettings.maxNumberOfControlPoints());
    }

    var result = approximator
        .compute(controlPanelViewModel.approximationSettings.approximationEndCondition(),
        endConditionValue);

    setResultPanel(result);

    var plotter = new BSplinePlotter(result.cp,
        result.knots,
        result.order,
        jsonInput.dataPoints,
        dataPoints);

    plotter.plot();


    var errorPlotter = new BSplineIterativeApproximationPlotter(approximator.results);
    errorPlotter.plot('result-canvas');
    $('#result-canvas').show();

    var blob = new Blob([JSON.stringify(result)], {type: "text/plain;charset=utf-8"});
    saveAs(blob,"Approximation Result.txt");

    var file = new Blob([JSON.stringify(result)], "Approximation Result.txt", {type: "text/plain;charset=utf-8"});
    saveAs(file);
}

function setResultPanel(result) {

    resultViewModel.numberOfFunctions(result.knots.length - 2 * controlPanelViewModel.order() - 1);
    resultViewModel.numberOfDataPoints(result.params.length);
    resultViewModel.numberOfControlPoints(result.cp.length);
    resultViewModel.numberOfKnots(result.knots.length);

    if (controlPanelViewModel.fittingMode() == 'approximation') {
        resultViewModel.minDistance(result.error.minDistance.toFixed(4));
        resultViewModel.maxDistance(result.error.maxDistance.toFixed(4));
        resultViewModel.avgDistance((result.error.totalDistance / result.params.length).toFixed(4));
        resultViewModel.totalLeastSquareDistance(result.error.totalLeastSquareDistance.toFixed(4));
    }

}
