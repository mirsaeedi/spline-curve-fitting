var uniformlySpacedMethod = function(dataPoints) {

    var parameters = [];
    var n = dataPoints.length - 1;

    for (var i = 0; i <=n; i++) {

        parameters.push(i/n);

    }

    return parameters;

}


var chordLengthMethod = function(dataPoints) {

    var parameters = [0];

    var totalLength = 0;
    var l = [];

    for (var k = 0; k < dataPoints.length-1; k++) {
        
        var distanceK = math.
        distance(
        { pointOneX: dataPoints[k].X, pointOneY: dataPoints[k].Y },
        { pointTwoX: dataPoints[k+1].X, pointTwoY: dataPoints[k+1].Y });

        totalLength += distanceK;
        l.push(totalLength);
    }

    for (var k = 0; k < dataPoints.length - 1; k++) {
        parameters.push(l[k]/totalLength);
    }

    return parameters;

}

var centripetalMethod = function (dataPoints,a) {

    var parameters = [0];

    var totalLength = 0;
    var l = [];

    for (var k = 0; k < dataPoints.length - 1; k++) {

        var length = math.
        distance(
        { pointOneX: dataPoints[k].X, pointOneY: dataPoints[k].Y },
        { pointTwoX: dataPoints[k + 1].X, pointTwoY: dataPoints[k + 1].Y });

        var distanceK = math.pow(length,a);

        totalLength += distanceK;
        l.push(totalLength);
    }

    for (var k = 0; k < dataPoints.length - 1; k++) {
        parameters.push(l[k] / totalLength);
    }

    return parameters;

}
