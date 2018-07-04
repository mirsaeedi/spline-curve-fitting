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
    compactApproximationParameters: ko.observable('no'),
    compactApproximationParametersQuality: ko.observable(16),
    compactApproximationBitLength: ko.observable(32),
    approximationSettings: {
        initialNumberOfControlPoints: ko.observable(5),
        approximationEndCondition: ko.observable('iteration-bounded'),
        errorBound: ko.observable(0.5),
        maxNumberOfControlPoints: ko.observable(100),
    },
    plot: function () {

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

    $('#iterative-approximation-canvas').hide();
    var dataPoints = reduceNoise(jsonInput);

    if (controlPanelViewModel.spline() == 'bspline') {

        if (controlPanelViewModel.fittingMode() == 'approximation') {
            if (controlPanelViewModel.approximationType() == 'non-iterative')
                nonIterativeBSplineApproximation(jsonInput, dataPoints);
            else if (controlPanelViewModel.approximationType() == 'iterative') {
                $('#iterative-approximation-canvas').show();
                iterativeBSplineApproximation(jsonInput, dataPoints);
            }

        }
        else if (controlPanelViewModel.fittingMode() == 'interpolation')
            bsplineInterpolation(jsonInput, dataPoints);
        else if (controlPanelViewModel.fittingMode() == 'controlPoints')
            bsplineControlPoints(jsonInput);

    }
    else if (controlPanelViewModel.spline() == 'bezier') {
        if (controlPanelViewModel.fittingMode() == 'controlPoints'){
            $('#resultPanel').hide();
            $('#resultPanel').hide();
            bezierControlPoints(jsonInput);
        }
            
    }else{

        if (controlPanelViewModel.spline() == 'piecewiseApproximation') {

            var segments = getSegments();
            piecewiseApproximation(dataPoints,segments);
        }
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

    var bspline = BSplineBuilder.build(jsonInput.order, jsonInput.controlPoints,
        jsonInput.knots);

    var plotter = new BSplinePlotter(bspline);

    plotter.plot();
}

function bsplineInterpolation(jsonInput, dataPoints) {

    var fittingStrategy = getFittingStrategy();

    var interpolationResult = BSplineBuilder.interpolate(dataPoints,
        parseInt(controlPanelViewModel.order()), fittingStrategy);

    setResultPanel(interpolationResult);

    var plotter = new BSplinePlotter(interpolationResult.bspline,
        jsonInput.dataPoints,
        dataPoints);

    plotter.plot();
}

function nonIterativeBSplineApproximation(jsonInput, dataPoints) {

    var fittingStrategy = getFittingStrategy();

    var approximationResult = BSplineBuilder.approximate(dataPoints,
        parseInt(controlPanelViewModel.order()),
        parseInt(controlPanelViewModel.numberOfControlPoints()),
        fittingStrategy);

    setResultPanel(approximationResult);

    var plotter = new BSplinePlotter(approximationResult.bspline,
        jsonInput.dataPoints,
        dataPoints,
        approximationResult);

    plotter.plot();

}

function iterativeBSplineApproximation(jsonInput, dataPoints) {

    var fittingStrategy = getFittingStrategy();
    var iterativeApproximationStrategy = getIterativeApproximationStrategy();

    var approximationResult = BSplineBuilder.iterativeAproximate(dataPoints,
        parseInt(controlPanelViewModel.order()),
        parseInt(controlPanelViewModel.numberOfControlPoints()),
        fittingStrategy, iterativeApproximationStrategy);

    setResultPanel(approximationResult.bestApproximation);

    var plotter = new BSplinePlotter(approximationResult.bestApproximation.bspline,
        jsonInput.dataPoints,
        dataPoints,
        approximationResult.bestApproximation);

    plotter.plot();

    var errorPlotter = new BSplineIterativeApproximationPlotter(approximationResult);
    errorPlotter.plot('iterative-approximation-canvas');

    outputIterativeApproximationResult(approximationResult);
}

function piecewiseApproximation(dataPoints,segments){

    var approximator = new PiecewiseApproximator(segments,dataPoints);
    var result = approximator.approximate();
    
    var plotter = new PiecewisePlotter(
        segments,
        dataPoints);

    plotter.plot();

        resultViewModel.minDistance(result.error.minDistance.toFixed(4));
        resultViewModel.maxDistance(result.error.maxDistance.toFixed(4));
        resultViewModel.avgDistance(result.error.avgDistance.toFixed(4));

    var output='Piecewise Curve Fitting Result: \n';

    for(var i=0;i<segments.length;i++){

        output+='segment['+(i+1)+'] Parameters=' + segments[i].func.parameters +'\n';

        if(segments[i].transient){
            output+='segment['+(i+1)+'] Transient Parameters=' + segments[i].transient.func.parameters +'\n';
        }

    }

    var blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "Approximation Result.txt");
}

function polynomialFunctionApproximation(func,order,jsonInput, dataPoints){

    var approximator = new LeastSquareApproximation(func,order,dataPoints);
    var polynomial = approximator.approximate();

    var plotter = new PolynomialPlotter(
        polynomial,
        dataPoints);

    plotter.plot();
}

function outputIterativeApproximationResult(approximationResult) {

    var result = approximationResult.bestApproximation.bspline;
    var cp = result.getControlPoints();
    var output = 'controlPoints:\n';

    for (var i = 0; i < cp.length; i++) {
        output += cp[i].x + '\t' + cp[i].y + '\n'
    }

    output += 'knots:\n';
    output += result.getKnots() + '\n';

    if (controlPanelViewModel.compactApproximationParameters() == 'yes') {
        output += 'compression_slices:\n';
        output += result.compression.rangeSlices + '\n';
        output += 'compression_parameters:\n';
        output += result.compression.compressedParameters + '\n';
    }

    output += 'order:' + result.getOrder() + '\n';

    output += 'polynomial functions of X(t):\n';
    var xFunctions = result.getXFunctions();

    for(var i=0;i<xFunctions.length;i++){
        output += xFunctions[i].func.toString() + '\n';
    }

    output += 'polynomail functions of Y(t):\n';
    var yFunctions = result.getYFunctions();
    for(var i=0;i<yFunctions.length;i++){
        output += yFunctions[i].func.toString() + '\n';
    }

    var blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "Approximation Result.txt");

}

function setResultPanel(result) {

    resultViewModel.numberOfFunctions(result.bspline.getKnots().length - 2 * result.bspline.getOrder() - 1);
    resultViewModel.numberOfDataPoints(result.params.length);
    resultViewModel.numberOfControlPoints(result.bspline.getControlPoints().length);
    resultViewModel.numberOfKnots(result.bspline.getKnots().length);

    if (controlPanelViewModel.fittingMode() == 'approximation') {
        resultViewModel.minDistance(result.error.minDistance.toFixed(4));
        resultViewModel.maxDistance(result.error.maxDistance.toFixed(4));
        resultViewModel.avgDistance((result.error.totalDistance / result.params.length).toFixed(4));
        resultViewModel.totalLeastSquareDistance(result.error.totalLeastSquareDistance.toFixed(4));
    }

}

function getFittingStrategy() {

    var parameterSelectionStrategy = null;
    var knotSelectionStrategy = null;
    var compressionStrategy = null;

    if (controlPanelViewModel.parameterSelection() == 'chord-length')
        parameterSelectionStrategy = new ParameterSelectionStrategies.ChordLengthStrategy();
    else if (controlPanelViewModel.parameterSelection() == 'centripetal')
        parameterSelectionStrategy = new ParameterSelectionStrategies.CentripetalStrategy();
    else if (controlPanelViewModel.parameterSelection() == 'x-length')
        parameterSelectionStrategy = new ParameterSelectionStrategies.XLengthStrategy();
    else if (controlPanelViewModel.parameterSelection() == 'uniformly-spaced')
        parameterSelectionStrategy = new ParameterSelectionStrategies.UniformlySpacedStrategy();
    else if (controlPanelViewModel.parameterSelection() == 'universal')
        parameterSelectionStrategy = new ParameterSelectionStrategies.UniversalStrategy();

    if (controlPanelViewModel.knotSelection() == 'uniformly-spaced')
        knotSelectionStrategy = new KnotSelectionStrategies.UniformlySpacedStrategy();
    else if (controlPanelViewModel.knotSelection() == 'deboor-average')
        knotSelectionStrategy = new KnotSelectionStrategies.DeboorAverageApproximationStrategy(controlPanelViewModel.fittingMode());

    if (controlPanelViewModel.parameterSelection() == 'universal')
        knotSelectionStrategy = null;

    if (controlPanelViewModel.compactApproximationParameters() == 'yes') {
        compressionStrategy = new CompressionStrategy(controlPanelViewModel.compactApproximationParametersQuality(),
            controlPanelViewModel.compactApproximationBitLength());
    }

    return new FittingStrategy(parameterSelectionStrategy, knotSelectionStrategy, compressionStrategy);

}

function getIterativeApproximationStrategy() {

    var iterativeApproximationStrategy = null;

    var iterativeApproximationStrategy =
        new IterativeApproximationStrategy(controlPanelViewModel.approximationSettings.initialNumberOfControlPoints(),
            controlPanelViewModel.approximationSettings.approximationEndCondition(),
            controlPanelViewModel.approximationSettings.approximationEndCondition() == 'error-bounded'
                ? controlPanelViewModel.approximationSettings.errorBound()
                : controlPanelViewModel.approximationSettings.maxNumberOfControlPoints());

    return iterativeApproximationStrategy;
}