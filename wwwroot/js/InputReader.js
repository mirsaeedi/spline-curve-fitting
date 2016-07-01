var InputReader = {};

InputReader.read = function(file,callback) {
    
    var reader = new FileReader();

    reader.onload = function (e) {
        var content = reader.result;
        callback(JSON.parse(content));
    }

    reader.readAsText(file);

}