var DeCasteljauAlgorithm = function(controlPoints){

    this.compute = function(t){

        var n = controlPoints.length - 1

        var q=[];

        for (var i = 0; i <=n ; i++)
            q.push(controlPoints[i]);

        for (var i = 1; i <= n; i++) {
            
            for (var j = 0; j <= n - i; j++) {

                var x = (1-t)*q[j].x+t*q[j+1].x;
                var y = (1-t)*q[j].y+t*q[j+1].y;

                q[j]=new Point(x,y);
            }
        }

        return q[0];
    }
}