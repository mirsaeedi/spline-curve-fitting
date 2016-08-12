function getSegments() {
    var segments = [{
        firstPointIndex: 0,
        lastPointIndex: 10,
        order: 3,
        model: MonomialFunc,
        approximationType: 'linear'
    },
        {
            firstPointIndex: 11,
            lastPointIndex: 30,
            order: 3,
            model: MonomialFunc,
            approximationType: 'linear'
        },
        {
            firstPointIndex: 31,
            lastPointIndex: 51,
            order: 3,
            model: MonomialFunc,
            approximationType: 'linear'
        }];

    return segments;
}