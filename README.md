# Spline Curve Fitting

This project provide you with several curve fitting methods. Moreover, for each method you can visually observe the error. The implemented curve fitting methods are as follows. Each of the methods support specific parameters for _Approximation_ and _Interpolation_ which give you a flexibility in shaping the curve you desire. 

:cupid: For implementing [_B-Spline_](https://github.com/mirsaeedi/spline-curve-fitting/tree/master/wwwroot/js/BSpline) and [_Bezier_](https://github.com/mirsaeedi/spline-curve-fitting/tree/master/wwwroot/js/Bezier) curves, I exactly followed _Dr. Shene's_ [notes](https://pages.mtu.edu/~shene/COURSES/cs3621/NOTES/) which seems to be the best available resource on this matter.

## B-Spline Interpolation and Approximation

For _B-Spline_ you can select from several _knot_ and _Parameter_ selection algorithms and you are free to choose the number of _control points_. Even you are able to find the curve with least error using _Error Limit Settings_.
In addition, you need to provide the panel with an input file containing your points. This file must be in a form of a [JSON](https://github.com/mirsaeedi/spline-curve-fitting/blob/master/Test%20Data/Approximation-Interpolation/Test1.txt) or a [white-space](https://github.com/mirsaeedi/spline-curve-fitting/blob/master/Test%20Data/Approximation-Interpolation/Test5.txt) seperated file.

## Bezier Interpolation and Approximation

For drawing a _Bezier_ curve you need to provide an input [file] containing _Control Points_.

## Piecewise Approximation

Using piecewise approximation you can approximate your data using several functions at the same time. In fact, in this approach you need to segment your data points and determine the approximation function to approximate that segment. Then, we approximate that segment using the determined function. In this approach, we connect two consecutive curves using a 3rd Order polynomial to smoothen the whole curve.

You can select following functions as segment approximator.

1. **Linear Reciprocal**
2. **Non-Linear Reciprocal**
3. **Non-Linear Exponential**
4. **Non-Linear Gaussian**
5. **Non-Linear SQRT**
6. **Chebyshev Polynomials First Kind**
7. **Chebyshev Polynomials Second Kind**
8. **Bessel Polynomials**
9. **Legendre Polynomials**
10. **Laguerre Polynomials**
11. **Monomial Polynomials**

You need to provide the panel with an input file containing your points. This file must be in a form of a [JSON](https://github.com/mirsaeedi/spline-curve-fitting/blob/master/Test%20Data/Approximation-Interpolation/Test1.txt) or a [white-space](https://github.com/mirsaeedi/spline-curve-fitting/blob/master/Test%20Data/Approximation-Interpolation/Test5.txt) seperated file.
You need define your segment by modifing the [**_SegmentDefiner_**](https://github.com/mirsaeedi/spline-curve-fitting/blob/master/wwwroot/js/FunctionApproximation/Piecewise/SegmentsDefiner.js) file.

# Usage

You just need to [download](https://github.com/mirsaeedi/spline-curve-fitting/archive/master.zip) the project and then open the _index.hmlt_ page using a modern Web Browser such as Google Chrome.
