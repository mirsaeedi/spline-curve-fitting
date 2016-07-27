var IterativeApproximationStrategy = function (initialNumberOfControlPoints,endConditionType,endConditionValue) {
    
    this.getInitialNumberOfControlPoints = function(){
        return initialNumberOfControlPoints;
    }

    this.getEndConditionType= function(){
        return endConditionType;
    }

    this.getEndConditionValue= function(){
        return endConditionValue;
    }

}