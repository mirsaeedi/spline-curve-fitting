var FittingStrategy = function (parameterSelectionStrategy, knotSelectionStrategy, compressionStrategy) {

    this.getParameters = function (dataPoints, a, p) {

        var parameters = parameterSelectionStrategy.getParameters(dataPoints, a, p);

        if (compressionStrategy) {
            var compressor = new ParameterCompressor(compressionStrategy);
            compressionResult = compressor.compress(parameters);
            parameters = compressionResult.compressedParameters;
        }

        return parameters;
    }

    this.getKnots = function (order, h, parameters) {

        return knotSelectionStrategy
            ? knotSelectionStrategy.getKnots(order, h, parameters)
            : parameterSelectionStrategy.getKnots(order, h, parameters);

    }

};