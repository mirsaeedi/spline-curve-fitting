var LeastSquareApproximation = function(func,n,dataPoints){

    var self=this;

    self.approximate=function () {
        
        var h=computeH(func,n,dataPoints);
        var hT = math.transpose(h);
        var hTh  = math.multiply(hT, h);

        var y=computeY(dataPoints);
        var hTy  = math.multiply(hT, y);

        var coefficients = computeCoefficients(hTh,hTy);
        return new LinearFunction(func,coefficients);
    }

    function computeCoefficients(hTh,hTy) {
        
        var coefficients = math.lusolve(hTh, hTy)

        for(var i=0;i<coefficients.length;i++){
           coefficients[i] = coefficients[i][0];
        }

        return coefficients;

    }

    function computeY(dataPoints) {
        
        var y=[];

        for(var i=0;i<dataPoints.length;i++){
            y.push(dataPoints[i].y);
        }

        return y;

    }

    function computeH(func,n,dataPoints) {
        
        var h=[];

        for(var i=0;i<dataPoints.length;i++){

            var row = [];

            for (var j = 0; j <=n; j++) {
                
                row.push(func.compute(j,dataPoints[i].x));
            }

            h.push(row);

        }

        return h;

    }

};