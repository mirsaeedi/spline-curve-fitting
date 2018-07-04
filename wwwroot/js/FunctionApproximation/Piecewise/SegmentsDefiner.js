function getSegments() {
    var segments = [{
            firstPointIndex: 0,
            lastPointIndex: 99,
            order: 5,
            model: MonomialFunc,
            approximationType: 'linear'
        },
        {
            firstPointIndex: 100,
            lastPointIndex: 149,
            order: 3,
            model: MonomialFunc,
            approximationType: 'linear'
        },
        {
            firstPointIndex: 150,
            lastPointIndex: 199,
            order: 2,
            model: MonomialFunc,
            approximationType: 'linear'
        }];

    return segments;
}