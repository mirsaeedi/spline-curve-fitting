var InputReader = new function () {

    this.read = function (file, callback) {

        var reader = new FileReader();

        reader.onload = function (e) {
            var content = reader.result;
            callback(parse(content));
        }

        reader.readAsText(file);
    }
    
    parse = function(content){

        if(content.indexOf('{')>=0)
            return JSON.parse(content);
        
        var lines = content.split("\n");
        var splitor = lines[0].indexOf(',')>0? /,/g : /\s+/g
        
        var result = {dataPoints:[]};

        for(var i=0;i<lines.length;i++){

            var items = lines[i].trim().split(splitor);
            result.dataPoints.push(new Point(parseFloat(items[0]),parseFloat(items[1])))

        }

        return result;

    }

}
