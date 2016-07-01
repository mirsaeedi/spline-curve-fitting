var BasisFunction = function(knots) {
    
    this.compute=function (t,i,p) {

        var m = knots.length - 1;
        var N = [];

        if (i === 0 && t === knots[0])
            return 1;

        if (i === m-p-1  && t === knots[m])
            return 1;

        if (t < knots[i] || t >= knots[i + p + 1])
            return 0;

        for (var j = 0; j <= p; j++) {
            if (t >= knots[i + j] && t < knots[i + j + 1])
                N.push(1.0);
            else
                N.push(0.0);
        }

        var saved = 0.0;

        for (var k = 1; k <= p; k++) {

            if (N[0] === 0.0)
                saved = 0.0;
            else {
                saved = ((t - knots[i]) * N[0]) / (knots[i + k] - knots[i]);
            }

            for (var j = 0; j < p-k+1; j++) {
            
                var left = knots[i+j+1];
                var right = knots[i + j + k + 1];

                if (N[j + 1] == 0.0) {
                    N[j] = saved;
                    saved = 0.0;
                } else {
                    var temp = N[j + 1] / (right - left);
                    N[j] = saved + (right - t) * temp;
                    saved = (t - left) * temp;
                }
            }

        }

        return N[0];
    }



}