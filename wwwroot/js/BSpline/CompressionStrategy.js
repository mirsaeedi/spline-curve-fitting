var CompressionStrategy = function (quality, bitLength) {

    this.getQuality = function () {
        return quality;
    }

    this.getBitLength = function () {
        return bitLength;
    }

}