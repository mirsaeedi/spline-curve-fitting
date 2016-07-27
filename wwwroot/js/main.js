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
    compactApproximationParameters:ko.observable('no'),
    compactApproximationParametersQuality:ko.observable(16),
    compactApproximationBitLength:ko.observable(32),
    approximationSettings: {
        initialNumberOfControlPoints: ko.observable(5),
        approximationEndCondition: ko.observable('iterationBounded'),
        errorBound: ko.observable(0.5),
        maxNumberOfControlPoints: ko.observable(100),
    },
    plot: function () {
        
        /*        
        var dataPoint = [];
        for (var i = -10; i < 10; i += 0.1) {
            //dataPoint.push(new Point(i,Math.sin(i)));
            dataPoint.push(new Point(i, Math.sin(i) * Math.cos(i) * i));
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

    $('#iterative-approximation-canvas').hide();
    var dataPoints = reduceNoise(jsonInput);

    if (controlPanelViewModel.spline() == 'bspline') {

        if (controlPanelViewModel.fittingMode() == 'approximation') {
            if (controlPanelViewModel.approximationType() == 'non-iterative')
                nonIterativeBSplineApproximation(jsonInput,dataPoints);
            else if (controlPanelViewModel.approximationType() == 'iterative'){
                $('#iterative-approximation-canvas').show();
                iterativeBSplineApproximation(jsonInput,dataPoints);
            }
                
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

    var bspline = BSplineBuilder.build(jsonInput.order,jsonInput.controlPoints,
        jsonInput.knots);

    var plotter = new BSplinePlotter(bspline);

    plotter.plot();
}

function bsplineInterpolation(jsonInput,dataPoints) {

    var fittingStrategy = getFittingStrategy();

    var interpolationResult = BSplineBuilder.interpolate(dataPoints,
        parseInt(controlPanelViewModel.order()),fittingStrategy);

    setResultPanel(interpolationResult);

    var plotter = new BSplinePlotter(bspline,
        jsonInput.dataPoints,
        dataPoints);

    plotter.plot();
}

function nonIterativeBSplineApproximation(jsonInput,dataPoints) {

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

function iterativeBSplineApproximation(jsonInput,dataPoints) {

    var fittingStrategy = getFittingStrategy();
    var iterativeApproximationStrategy = getIterativeApproximationStrategy();

    var approximationResult = BSplineBuilder.iterativeAproximate(dataPoints,
        parseInt(controlPanelViewModel.order()),
        parseInt(controlPanelViewModel.numberOfControlPoints()),
        fittingStrategy,iterativeApproximationStrategy);

    setResultPanel(approximationResult.bestApproximation);

    var plotter = new BSplinePlotter(approximationResult.bestApproximation.bspline,
        jsonInput.dataPoints,
        dataPoints,
        approximationResult.bestApproximation);

    plotter.plot();

    var errorPlotter = new BSplineIterativeApproximationPlotter(approximationResult);
    errorPlotter.plot('iterative-approximation-canvas');

    var output='controlPoints:\n';

    for(var i=0;i<result.cp.length;i++){
        output+= result.cp[i].x +'\t'+ result.cp[i].y+'\n'
    }

    output+= 'knots:\n';
    output+= result.knots + '\n';

    if(controlPanelViewModel.compactApproximationParameters() =='yes'){
            output+= 'compression_slices:\n';
            output+= result.compression.rangeSlices + '\n';
            output+= 'compression_parameters:\n';
            output+= result.compression.compressedParameters + '\n';
    }

    var blob = new Blob([output], {type: "text/plain;charset=utf-8"});

    saveAs(blob,"Approximation Result.txt");
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

function getFittingStrategy(){

    var parameterSelectionStrategy = null;
    var knotSelectionStrategy = null;
    var compressionStrategy = null;

    if(controlPanelViewModel.parameterSelection()=='chord-length')
        parameterSelectionStrategy = new ParameterSelectionStrategies.ChordLengthStrategy();
    if(controlPanelViewModel.parameterSelection()=='centripetal')
        parameterSelectionStrategy = new ParameterSelectionStrategies.CentripetalStrategy();
    if(controlPanelViewModel.parameterSelection()=='x-length')
        parameterSelectionStrategy = new ParameterSelectionStrategies.XLengthStrategy();
    if(controlPanelViewModel.parameterSelection()=='uniformly-spaced')
        parameterSelectionStrategy = new ParameterSelectionStrategies.UniformlySpacedStrategy();
    if(controlPanelViewModel.parameterSelection()=='universal')
        parameterSelectionStrategy = new ParameterSelectionStrategies.UniversalStrategy();

    if(controlPanelViewModel.knotSelection()=='uniformly-spaced')
        knotSelectionStrategy = new KnotSelectionStrategies.UniformlySpacedStrategy();
    if(controlPanelViewModel.knotSelection()=='deboor-average')
        knotSelectionStrategy = new KnotSelectionStrategies.DeboorAverageApproximationStrategy();

    if(controlPanelViewModel.compactApproximationParameters()=='yes'){
        compressionStrategy = new CompressionStrategy(controlPanelViewModel.compactApproximationParametersQuality(),
        controlPanelViewModel.compactApproximationBitLength());
    }

    return new FittingStrategy(parameterSelectionStrategy,knotSelectionStrategy,compressionStrategy);

}

function getIterativeApproximationStrategy(){

    var iterativeApproximationStrategy = null;

    var iterativeApproximationStrategy = 
        new IterativeApproximationStrategy(controlPanelViewModel.approximationSettings.initialNumberOfControlPoints(),
        controlPanelViewModel.approximationSettings.approximationEndCondition(),
        controlPanelViewModel.approximationSettings.approximationEndCondition()=='error-bound'
        ?controlPanelViewModel.approximationSettings.errorBound()
        :controlPanelViewModel.approximationSettings.maxNumberOfControlPoints());

    return iterativeApproximationStrategy;
}