var ParameterCompressor =  function(){

    this.compress=function (quality,params) {
        
        var sliceLength = quality*64 + 1;
        var compressedParameters = [0];

        var rangeSlices = []
        for(var i=0;i<sliceLength;i++)
                rangeSlices.push(0);

        var lastSlice = 0;

        for(var i=1;i<params.length-1;i++){

            for(var j= lastSlice;j < sliceLength;){

                    if(lastSlice==sliceLength-1){
                        for(k=lastSlice;k>0;k--){
                            if(rangeSlices[k]==0){
                                rangeSlices[k]=1;
                                compressedParameters.push(k/sliceLength);
                                break;
                            }
                        }
                        break;
                    }

                    if(
                        (params[i]>=lastSlice/sliceLength && params[i]<(lastSlice+1)/sliceLength)
                        || lastSlice/sliceLength>params[i]
                    ){

                        for(k=lastSlice+1;k<sliceLength;k++){
                            if(rangeSlices[k]==0){
                                rangeSlices[k]=1;
                                lastSlice = k;
                                compressedParameters.push(lastSlice/sliceLength);
                                break;
                            }
                        }
                        break;
                    }
                    lastSlice++;
            }
        }

        compressedParameters.push(1);

        return {compressedParameters:compressedParameters,rangeSlices:rangeSlices};

    }

}