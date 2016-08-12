// "use strict"
var jsfit = (typeof exports === "undefined")?(function jsfit() {}):(exports);
if(typeof global !== "undefined") { global.jsfit = jsfit; }


//some helper functions
var toType = function(obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z0-9]+)/)[1].toLowerCase();
};


var pprint = numeric.prettyPrint;

//some commonly used models.
jsfit.models = {

  exponential : function (x, params) {
    var C = params[0], 
        A = params[1], 
        k = params[2];
    return (C + A * Math.exp(-k * x));
  },

  flat : function (x, params) {
    var k = params[0];
    return k;
  },

  linear :  function (x, params) {
    var m = params[0], 
        b = params[1];
    return (m*x + b);
  },

  sine : function (x, params) {
    var C = params[0],
        A = params[1],
        w = params[2];
    return C + A * Math.sin(w*x);
  },

  gaussian : function (x, params) {
    var C = params[0],
        A = params[1],
        mu = params[2],
        sig = params[3];
    return C + A*Math.exp(-(Math.pow(x - mu, 2))/(2 * Math.pow(sig, 2)));
  },

  rosenbrock: function (X, params) {
    /* 
      f(x,y)=(1-x)^2+100(y-x^2)^2 
      Has a global minimum at (1, 1)
    */

    var x = params[0],
        y = params[1];
    return Math.pow((1 - x), 2) + 100* Math.pow((y - Math.pow(x, 2)), 2);
  }

};


jsfit.fit = function (model, data, initialParams, options) {
  //make a copy to keep around inside the methods. 
  var self = {};

  self.debugLog = function (args) {
    if (self.fitterOptions.debug) {
      for (var i=0;i<arguments.length;i++) {
        console.log(numeric.prettyPrint(arguments[i]));
      }
    }
  };

  //calculates the residuals from the  y-values and the model/params
  // r_i = 1/w_i * (y_i - model(x_i, params))
  self.residuals = function(params) {

    // var resid = [];
    var resid = new Float32Array(self.xvals.length);
    for (var i=0; i<self.xvals.length; i++) {
      var val = (1/self.weights[i])*(self.yvals[i] - self.model(self.xvals[i], params));
      resid[i] = val;
    }
    return resid;
  };

  //gives the sum of the squared residuals.
  self.ssr = function(params) {
    var ssr;
    ssr = numeric.dot(self.residuals(params), self.residuals(params));
    return ssr;
  };

  self.chi2 = function (params) {
    var chi2 = 0.0, 
        obs, exp;

    for (var i=0; i<self.xvals.length; i++) {
      exp = self.model(self.xvals[i], params);
      obs = self.yvals[i];
      w = self.weights[i];
      chi2 += Math.pow((obs-exp), 2) / Math.pow(w, 2);
    }
    return chi2;
  };

  //passing in an m x n array, return an array with only the main diagonals, all the rest are zeros
  self.diagonal = function (arr) {
    var dim, out;
    dim = numeric.dim(arr);
    out = numeric.rep(dim, 0);
    for (var i=0; i<dim[0]; i++) {
      for (var j=0; j<dim[1]; j++) {
        if (i===j) {
          out[i][j] = arr[i][j];
        }
      }
    }
    return out;
  };

  self.hessian = function (params) {
    // H = 2 * Jt•J
    var jac, jacTrans, hes;
    jac = self.jacobian(params);
    jacTrans = numeric.transpose(jac);
    hes = numeric.mul(2.0, numeric.dot(jacTrans, jac));

    //fixed parameters should have a zero in the hessian
    // dim = numeric.dim(hes);
    // for (var i=0; i<dim[0]; i++) {
    //   if (self.free[i] === 0) {
    //     hes[i][i] = 0.0;
    //   }
    // }
    self.debugLog("hes", hes);
    return hes;
  };

  self.covar = function (params) {
    /*
      If the minimisation uses the weighted least-squares function f_i = (Y(x, t_i) - y_i) / \sigma_i then the covariance matrix 
      above gives the statistical error on the best-fit parameters resulting from the Gaussian errors \sigma_i on 
      the underlying data y_i. This can be verified from the relation \delta f = J \delta c and the
      fact that the fluctuations in f from the data y_i are normalised by \sigma_i and so satisfy <\delta f \delta f^T> = I.

      For an unweighted least-squares function f_i = (Y(x, t_i) - y_i) the covariance matrix above should be 
      multiplied by the variance of the residuals about the best-fit \sigma^2 = \sum (y_i - Y(x,t_i))^2 / (n-p) to 
      give the variance-covariance matrix \sigma^2 C. This estimates the statistical error on the best-fit 
      parameters from the scatter of the underlying data.
    */

    var hes, covar;
    hes = self.hessian(params);
    if (numeric.sum(hes) !== 0.0) {
      covar = numeric.inv(hes);
    } else {
      covar = numeric.rep(hes, 0.0);
    }
    if (!self.weightedFit) covar = numeric.mul(covar, self.totalError());
    return covar;
  };

  self.parameterErrors = function () {
    //should be just the diagonal elements of the covariance matrix
    var covar, 
        parameterErrors, 
        out = numeric.rep([self.npars], 0.0);
    covar = self.covar(self.params);
    parameterErrors = numeric.sqrt(numeric.getDiag(covar));
    self.debugLog("parameterErrors", parameterErrors);
    self.debugLog("parameterErrors", self.free);
    //Patch in the fixed parameters. . . 
    for (var i=0; i<self.params.length; i++) {
      if (self.free[i]) {
        out[i] = parameterErrors[i];
      } else {
        out[i] = 0.0;
      }
    }
    return out;
  };

  self.totalError = function() {
    // sig^2 = r(p)T * r(p) / (m -n) , m=# of obs, n = #of free params
    var totalError, dof, r;

    r = self.residuals(self.params);
    totalError = numeric.dot(r, r) / self.dof;
    return totalError;
  };

  self.where = function (arr, target) {
    /*
      Helper method. returns the indices of the elements that match the target. 
    */
    var dim, 
        indices =[];
    dim = numeric.dim(arr);
    indices = numeric.rep([arr.length], 0);
    if (dim.length === 1) {
      for (var i=0; i<dim[0]; i++) {
        if (arr[i] === target) {
          indices[i] = true;
        } else {
          indices[j] = false;
        }
      }
    } else if (dim.length === 2) {
      for (var i=0; i<dim[0]; i++) {
        for (var j=0; j<dim[1]; j++) {
          if (arr[i][j] == target) {
            indices[i][j] = true;
          } else {
            indices[i][j] = false;
          }
        }
      }
    }
    return indices;
  };

  self.jacobian = function(params) {
    // Calculate a numeric jacobiab of the parameters. 
    // Jt•J is the approximation of the hessian
    //
    var h, 
        fjac = numeric.rep([self.xvals.length, self.params.length],0),
        // fjac = [],
        origParams, 
        modParamsHigh,
        modParamsLow, 
        left, right, par_idx, col;

    for (var i=0; i<self.params.length; i++) {
      modParamsLow = params.slice(0);
      modParamsHigh = params.slice(0);
      //Scale the step to the magnitude of the paramter
      h = Math.abs(params[i] * self.epsilon);
      if (h === 0.0) h = self.epsilon;
      modParamsLow[i] = params[i] - h;
      modParamsHigh[i] = params[i] + h;
      for (var j=0; j<self.xvals.length; j++) {
        left = self.model(self.xvals[j], modParamsHigh);
        right = self.model(self.xvals[j], modParamsLow);
        fjac[j][i] = ((left - right) / (2*h)) / self.weights[j];
      }
    }
    //update the number of times jac has been calculated
    self.numJac++;
    return fjac;
  };

  self.fixParameters= function(pars) {
    //fix any parameters if they are going out of bounds
    if (self.fitterOptions.parInfo) {
      for (var k=0; k<pars.length; k++) {
        //set the limits, if they exist in the parInfo array
        if (self.fitterOptions.parInfo[k].limits) {
          if (pars[k] < self.fitterOptions.parInfo[k].limits[0]) {
            pars[k] = self.fitterOptions.parInfo[k].limits[0];
          }
          if (pars[k] > self.fitterOptions.parInfo[k].limits[1]) {
            pars[k] = self.fitterOptions.parInfo[k].limits[1];
          }
        }

        //reset the fixed params to the initial values
        if (self.fitterOptions.parInfo[k].fixed) {
          pars[k] = self.initialParams[k];
        }
      }
    }
    return pars;
  };


  // self.checkHessian = function (params) {
  //   var d ;
  //   d = self.diagonal(self.hessian(params));
  //   dim = numeric.dim(d);
  //   for (var i=0; i<dim[0]; i++){
  //     for (var j=0; j<dim[1]; j++) {
  //       if (d[i][j] === 0) {
  //         self.free[i] = 0;
  //       }
  //     }
  //   }

  // };

  self.lmStep = function (params, jac) {
    var newParams, 
        jacTrans, jtj, jtjInv, identity,
        diag, cost_gradient, g, delta, t, 
        allParams =[],
        gdim,
        allDelta = numeric.rep([self.npars], 0.0);

    // jac = self.jacobian(params);
    jacTrans = numeric.transpose(jac);
    jtj = numeric.dot(jacTrans, jac);
    diag = self.diagonal(jtj);
    cost_gradient = numeric.dot(jacTrans, self.residuals(params));
    g = numeric.add(jtj, numeric.mul(self.lambda, diag));
    self.debugLog("##### ITERATION " + self.iterationNumber + " #####");
    self.debugLog("jac:", jac);
    self.debugLog("jtj:", jtj);
    self.debugLog("g:", g);
    gdim = numeric.dim(g);

    //TODO: QR factorization? this just sets any zero elements in the 
    // diagonals to be small but non-zero
    for (var i=0; i<gdim[0]; i++) {
      if (g[i][i] === 0.0) {
        g[i][i] = self.epsilon;
      }
    }

    delta = numeric.dot(numeric.inv(g), cost_gradient);
    // console.log(delta);

    //Patch in the fixed parameters. . . 
    for (var i=0; i<self.free.length; i++) {
      if (self.free[i]) {
        allDelta[i] = delta[i];
      }
    }
    
    // delta = numeric.mul(delta, 1.0)
    newParams = numeric.add(params, allDelta);
    // console.log(params, newParams, allDelta)
    return newParams;
  };


  //perform the minimization iteratively  
  self.iterate = function (params) {
    var cost, newCost, newParams, fjac;

    fjac = self.jacobian(params);
    jacTrans = numeric.transpose(fjac);
    self.debugLog("iterate jacTrans:", jacTrans);

    cost = 0.5 * self.ssr(params);
    newParams = self.lmStep(params, fjac);
    //fix the params that are fixed or limited
    newParams = self.fixParameters(newParams);
    newCost = 0.5 * self.ssr(newParams);
    // console.log(cost, newCost, params, newParams)
    if (newCost < cost) {
      self.lambda *= self.lambdaMinus;
    } 
    // console.log(self.lambda, cost, newCost, params, newParams);
    self.debugLog("iterate cost, newCost:", cost, newCost);
    //this is the inner loop, where we keep increasing the damping parameter if
    //the cost is greater
    while (newCost > cost) {
      self.lambda *= self.lambdaPlus;
      newParams = self.lmStep(params, fjac);
      newCost = 0.5 * self.ssr(newParams);
    }
    //self.checkHessian(newParams);
    return newParams;
  };

  //the method for the fitter. All other methods are really internal.
  self.runFitter = function() {
    var paramEstimate = self.params,
        errorEstimate,
        oldParams,
        oldSSR,
        converge,
        ssr = self.ssr(paramEstimate), 
        paramErrors,
        t1 = new Date();

    //reset lambda each time a new fit is called? 
    self.lambda = 0.01;
    self.params = self.initialParams;
    self.iterationNumber = 0;

    for (var i=0; i<self.fitterOptions.maxIterations; i++) {
      self.iterationNumber++;
      oldParams = self.params;
      oldSSR = self.ssr(oldParams);
      self.params = self.iterate(oldParams);
      ssr = self.ssr(self.params);

      
      //If the SSR is really small, that means we are getting a perfect fit, so stop
      if (ssr < self.fitterOptions.ftol) {
        self.stopReason = "ftol";
        break;
      }

      //check for convergence based on change in SSR over last iterations
      converge = Math.abs((ssr-oldSSR)/ssr);
      self.debugLog("parEstimate", self.params, converge, ssr);
      if (converge < self.fitterOptions.ftol){
        self.stopReason = "convergence";
        break;
      }



    }
    if (self.iterationNumber == self.fitterOptions.maxIterations) {
      self.stopReason = "maxIterations";
    }
    return {
              "params": self.params,
              "parameterErrors": self.parameterErrors(),
              "parInfo": self.fitterOptions.parInfo,
              "hessian": self.hessian(self.params),
              "jac": self.jacobian(self.params),
              "covar": self.covar(self.params),
              "chi2": self.chi2(self.params), 
              "chi2red": self.chi2(self.params)/self.dof,
              "dof": self.dof, 
              "iterations":self.iterationNumber, 
              "stopReason":self.stopReason, 
              "initialParams": self.initialParams,
              "xvals": self.xvals, 
              "yvals": self.yvals,
              "residuals": self.residuals(self.params),
              "numJac": self.numJac, 
              "time": new Date() - t1, 
              "warnings": self.warnings
           };
  };


  self.init = function () {
    //the smallest possible delta due to floating point precision.
    self.epsilon = numeric.epsilon*100;
    //store the x values on self
    self.xvals = data[0];
    // if (toType(self.yvals) !== 'float32array') {
    //   var tx = new Float32Array(self.xvals.length);
    //   for (var i=0;i<self.xvals.length;i++){
    //     tx[i] = self.xvals[i];
    //   }
    //   self.xvals = tx;
    // }
    //store the y values on self
    self.yvals = data[1];
    if (toType(self.yvals) !== 'float32array') {
      var ty = new Float32Array(self.yvals.length);
      for (var i=0;i<self.yvals.length;i++){
        ty[i] = self.yvals[i];
      }
      self.yvals = ty;
    }
    //number of observations
    self.nvals = self.xvals.length;
    //the weights array, if it exists. If not, set all points to have unit weights
    if (data.length < 3) {
      self.weightedFit = false;
      self.weights = numeric.rep([self.nvals], 1.0);
    } else { 
      self.weights = data[2];
      self.weightedFit = true;
    }
    if (toType(self.weights) !== 'float32array') {
      var tw = new Float32Array(self.weights.length);
      for (var i=0;i<self.yvals.length;i++){
        tw[i] = self.weights[i];
      }
      self.weights = tw;
    }
    //store the parameters on self
    self.params = initialParams;
    //set the initial params
    self.initialParams = initialParams;
    //the number of parameters
    self.npars = initialParams.length;
    //An array indicating if the parameter is free of fixed 
    self.free = numeric.rep([self.npars], 1);
    //the number of free parameters
    self.nfree = self.params.length;
    //the number of degrees of freedom
    self.dof = self.nvals - self.nfree;
    //store the function for the model on self
    self.model = model;
    
    //the l-m damping parameter
    self.lambda = 0.1;
    //the lambda up paramaeter
    self.lambdaPlus = 5.0;
    //the lambda decrease parameter
    self.lambdaMinus = 0.5;
    //stopping reason
    self.stopReason = null;
    //number of jac calcs
    self.numJac = 0;
    //the reason for stopping
    self.stopReason = null;
    //the default fitter options
    var defaultOptions = {
      maxIterations: 200, 
      debug: false,
      ftol :1e-10, 
      chart: false,
      paramDeltaConverge: 0.0001,
    };

    if (self.xvals.length !== self.yvals.length) {
      throw new Error('x and y arrays are different lengths');
    }

    if (self.xvals.length !== self.weights.length) {
      throw new Error('x and weights arrays are different lengths');
    }

    //merge in any options that are passed in into the defaultOptions object
    self.fitterOptions = defaultOptions;
    for (var key in options) {
      if (options.hasOwnProperty(key)) {
        if (options[key] !== undefined) self.fitterOptions[key] = options[key];
      }
    }

    //Make sure that parInfo, if it came through, is the same length as the 
    //parameter array
    if (self.fitterOptions.parInfo) {
      if (self.fitterOptions.parInfo.length !== self.npars) {
        throw new Error('parInfo and params must be SAME length');
      }
      for (var i=0; i<self.npars; i++) {
        if (self.fitterOptions.parInfo[i].fixed) {
          self.free[i] = 0;
        }
      }
      self.nfree = numeric.sum(self.free);
      //degrees of freedom
      self.dof = self.nvals - self.nfree;
    }
    self.ifree = self.where(self.free, 1);
  };

  self.init();
  return self.runFitter();
};
