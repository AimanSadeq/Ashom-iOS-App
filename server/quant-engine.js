'use strict';

// ============================================================================
// VIFM GCC Financial Analysis Platform — Quantitative Finance Engine
// ============================================================================
// Pure computation library. No database access, no side effects.
// All functions receive arrays/matrices and return results.
// ============================================================================

// ========== SECTION 1: Statistical Foundations ==========

/**
 * Arithmetic mean of an array.
 * @param {number[]} arr
 * @returns {number}
 */
function mean(arr) {
    if (!arr || arr.length === 0) return 0;
    let sum = 0;
    for (let i = 0; i < arr.length; i++) sum += arr[i];
    return sum / arr.length;
}

/**
 * Weighted arithmetic mean.
 * @param {number[]} arr - Values
 * @param {number[]} weights - Corresponding weights
 * @returns {number}
 */
function weightedMean(arr, weights) {
    if (!arr || arr.length === 0 || !weights || weights.length === 0) return 0;
    const n = Math.min(arr.length, weights.length);
    let sumWV = 0, sumW = 0;
    for (let i = 0; i < n; i++) {
        sumWV += arr[i] * weights[i];
        sumW += weights[i];
    }
    return sumW === 0 ? 0 : sumWV / sumW;
}

/**
 * Population standard deviation using Welford's online algorithm for numerical stability.
 * @param {number[]} arr
 * @returns {number}
 */
function stdDev(arr) {
    if (!arr || arr.length < 2) return 0;
    let m = 0, s = 0;
    for (let i = 0; i < arr.length; i++) {
        const delta = arr[i] - m;
        m += delta / (i + 1);
        s += delta * (arr[i] - m);
    }
    return Math.sqrt(s / arr.length);
}

/**
 * Sample standard deviation (Bessel-corrected, n-1 denominator) using Welford's algorithm.
 * @param {number[]} arr
 * @returns {number}
 */
function sampleStdDev(arr) {
    if (!arr || arr.length < 2) return 0;
    let m = 0, s = 0;
    for (let i = 0; i < arr.length; i++) {
        const delta = arr[i] - m;
        m += delta / (i + 1);
        s += delta * (arr[i] - m);
    }
    return Math.sqrt(s / (arr.length - 1));
}

/**
 * Sample covariance between two arrays.
 * @param {number[]} x
 * @param {number[]} y
 * @returns {number}
 */
function covariance(x, y) {
    if (!x || !y) return 0;
    const n = Math.min(x.length, y.length);
    if (n < 2) return 0;
    const mx = mean(x.slice(0, n));
    const my = mean(y.slice(0, n));
    let sum = 0;
    for (let i = 0; i < n; i++) {
        sum += (x[i] - mx) * (y[i] - my);
    }
    return sum / (n - 1);
}

/**
 * Pearson correlation coefficient.
 * @param {number[]} x
 * @param {number[]} y
 * @returns {number}
 */
function correlation(x, y) {
    const n = Math.min(x.length, y.length);
    if (n < 2) return 0;
    const sx = sampleStdDev(x.slice(0, n));
    const sy = sampleStdDev(y.slice(0, n));
    if (sx === 0 || sy === 0) return 0;
    return covariance(x, y) / (sx * sy);
}

/**
 * Compute the p-th percentile of an array (0-100). Uses linear interpolation.
 * @param {number[]} arr
 * @param {number} p - Percentile (0 to 100)
 * @returns {number}
 */
function percentile(arr, p) {
    if (!arr || arr.length === 0) return 0;
    if (arr.length === 1) return arr[0];
    const sorted = arr.slice().sort((a, b) => a - b);
    const idx = (p / 100) * (sorted.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    if (lo === hi) return sorted[lo];
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

/**
 * Sample skewness (Fisher's definition).
 * @param {number[]} arr
 * @returns {number}
 */
function skewness(arr) {
    if (!arr || arr.length < 3) return 0;
    const n = arr.length;
    const m = mean(arr);
    const sd = sampleStdDev(arr);
    if (sd === 0) return 0;
    let sum3 = 0;
    for (let i = 0; i < n; i++) {
        sum3 += Math.pow((arr[i] - m) / sd, 3);
    }
    return (n / ((n - 1) * (n - 2))) * sum3;
}

/**
 * Sample excess kurtosis (Fisher's definition, normal = 0).
 * @param {number[]} arr
 * @returns {number}
 */
function kurtosis(arr) {
    if (!arr || arr.length < 4) return 0;
    const n = arr.length;
    const m = mean(arr);
    const sd = sampleStdDev(arr);
    if (sd === 0) return 0;
    let sum4 = 0;
    for (let i = 0; i < n; i++) {
        sum4 += Math.pow((arr[i] - m) / sd, 4);
    }
    const rawKurt = (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3)) * sum4;
    const correction = (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
    return rawKurt - correction;
}

/**
 * Downside deviation: standard deviation of returns below the threshold.
 * @param {number[]} returns
 * @param {number} [threshold=0] - MAR (minimum acceptable return)
 * @returns {number}
 */
function downsideDeviation(returns, threshold) {
    if (!returns || returns.length === 0) return 0;
    if (threshold === undefined) threshold = 0;
    let sumSq = 0, count = 0;
    for (let i = 0; i < returns.length; i++) {
        const diff = returns[i] - threshold;
        if (diff < 0) {
            sumSq += diff * diff;
            count++;
        }
    }
    return count === 0 ? 0 : Math.sqrt(sumSq / returns.length);
}

/**
 * Apply a function to rolling windows of a given size.
 * @param {number[]} arr
 * @param {number} size - Window size
 * @param {function} fn - Function to apply to each window (receives sub-array)
 * @returns {number[]}
 */
function rollingWindow(arr, size, fn) {
    if (!arr || arr.length < size || size < 1) return [];
    const result = [];
    for (let i = 0; i <= arr.length - size; i++) {
        result.push(fn(arr.slice(i, i + size)));
    }
    return result;
}


// ========== SECTION 2: Matrix Operations ==========

/**
 * Create a matrix (2D array) filled with a value or zeros.
 * @param {number} rows
 * @param {number} cols
 * @param {number} [fill=0]
 * @returns {number[][]}
 */
function matrixCreate(rows, cols, fill) {
    if (fill === undefined) fill = 0;
    const M = [];
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) row.push(fill);
        M.push(row);
    }
    return M;
}

/**
 * Matrix multiplication A (m×n) × B (n×p) = C (m×p).
 * @param {number[][]} A
 * @param {number[][]} B
 * @returns {number[][]}
 */
function matrixMultiply(A, B) {
    const m = A.length;
    const n = A[0].length;
    const p = B[0].length;
    if (B.length !== n) throw new Error('matrixMultiply: incompatible dimensions');
    const C = matrixCreate(m, p);
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < p; j++) {
            let s = 0;
            for (let k = 0; k < n; k++) s += A[i][k] * B[k][j];
            C[i][j] = s;
        }
    }
    return C;
}

/**
 * Matrix transpose.
 * @param {number[][]} A
 * @returns {number[][]}
 */
function matrixTranspose(A) {
    const m = A.length, n = A[0].length;
    const T = matrixCreate(n, m);
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) T[j][i] = A[i][j];
    }
    return T;
}

/**
 * Matrix inverse via Gauss-Jordan elimination with partial pivoting.
 * @param {number[][]} A - Square matrix
 * @returns {number[][]}
 */
function matrixInverse(A) {
    const n = A.length;
    if (n === 0 || A[0].length !== n) throw new Error('matrixInverse: not square');

    // Augmented matrix [A | I]
    const aug = [];
    for (let i = 0; i < n; i++) {
        const row = [];
        for (let j = 0; j < n; j++) row.push(A[i][j]);
        for (let j = 0; j < n; j++) row.push(i === j ? 1 : 0);
        aug.push(row);
    }

    for (let col = 0; col < n; col++) {
        // Partial pivoting: find row with largest absolute value in this column
        let maxRow = col, maxVal = Math.abs(aug[col][col]);
        for (let row = col + 1; row < n; row++) {
            if (Math.abs(aug[row][col]) > maxVal) {
                maxVal = Math.abs(aug[row][col]);
                maxRow = row;
            }
        }
        if (maxVal < 1e-14) throw new Error('matrixInverse: singular matrix');
        // Swap rows
        if (maxRow !== col) {
            const tmp = aug[col]; aug[col] = aug[maxRow]; aug[maxRow] = tmp;
        }
        // Scale pivot row
        const pivot = aug[col][col];
        for (let j = 0; j < 2 * n; j++) aug[col][j] /= pivot;
        // Eliminate column in other rows
        for (let row = 0; row < n; row++) {
            if (row === col) continue;
            const factor = aug[row][col];
            for (let j = 0; j < 2 * n; j++) {
                aug[row][j] -= factor * aug[col][j];
            }
        }
    }

    // Extract right half
    const inv = matrixCreate(n, n);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) inv[i][j] = aug[i][n + j];
    }
    return inv;
}

/**
 * Element-wise matrix addition.
 * @param {number[][]} A
 * @param {number[][]} B
 * @returns {number[][]}
 */
function matrixAdd(A, B) {
    const m = A.length, n = A[0].length;
    const C = matrixCreate(m, n);
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) C[i][j] = A[i][j] + B[i][j];
    }
    return C;
}

/**
 * Scalar multiplication of a matrix.
 * @param {number[][]} A
 * @param {number} scalar
 * @returns {number[][]}
 */
function matrixScale(A, scalar) {
    const m = A.length, n = A[0].length;
    const C = matrixCreate(m, n);
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) C[i][j] = A[i][j] * scalar;
    }
    return C;
}

/**
 * Matrix determinant via LU decomposition with partial pivoting.
 * @param {number[][]} A - Square matrix
 * @returns {number}
 */
function matrixDeterminant(A) {
    const n = A.length;
    if (n === 0 || A[0].length !== n) throw new Error('matrixDeterminant: not square');
    if (n === 1) return A[0][0];
    if (n === 2) return A[0][0] * A[1][1] - A[0][1] * A[1][0];

    // Copy matrix
    const M = A.map(row => row.slice());
    let det = 1;
    for (let col = 0; col < n; col++) {
        let maxRow = col, maxVal = Math.abs(M[col][col]);
        for (let row = col + 1; row < n; row++) {
            if (Math.abs(M[row][col]) > maxVal) {
                maxVal = Math.abs(M[row][col]);
                maxRow = row;
            }
        }
        if (maxVal < 1e-14) return 0;
        if (maxRow !== col) {
            const tmp = M[col]; M[col] = M[maxRow]; M[maxRow] = tmp;
            det *= -1;
        }
        det *= M[col][col];
        for (let row = col + 1; row < n; row++) {
            const factor = M[row][col] / M[col][col];
            for (let j = col + 1; j < n; j++) {
                M[row][j] -= factor * M[col][j];
            }
        }
    }
    return det;
}

/**
 * Cholesky decomposition: A = L * L^T. A must be symmetric positive-definite.
 * @param {number[][]} A
 * @returns {number[][]} Lower triangular matrix L
 */
function choleskyDecomposition(A) {
    const n = A.length;
    const L = matrixCreate(n, n);
    for (let i = 0; i < n; i++) {
        for (let j = 0; j <= i; j++) {
            let sum = 0;
            for (let k = 0; k < j; k++) sum += L[i][k] * L[j][k];
            if (i === j) {
                const diag = A[i][i] - sum;
                if (diag <= 0) throw new Error('choleskyDecomposition: not positive-definite');
                L[i][j] = Math.sqrt(diag);
            } else {
                L[i][j] = (A[i][j] - sum) / L[j][j];
            }
        }
    }
    return L;
}

/**
 * Compute N×N covariance matrix from a matrix of return series (each column is an asset).
 * @param {number[][]} returnsMatrix - T×N matrix (T observations, N assets)
 * @returns {number[][]} N×N covariance matrix
 */
function covarianceMatrix(returnsMatrix) {
    if (!returnsMatrix || returnsMatrix.length < 2) return [];
    const T = returnsMatrix.length;
    const N = returnsMatrix[0].length;
    // Extract columns
    const cols = [];
    for (let j = 0; j < N; j++) {
        const col = [];
        for (let i = 0; i < T; i++) col.push(returnsMatrix[i][j]);
        cols.push(col);
    }
    const C = matrixCreate(N, N);
    for (let i = 0; i < N; i++) {
        for (let j = i; j < N; j++) {
            const c = covariance(cols[i], cols[j]);
            C[i][j] = c;
            C[j][i] = c;
        }
    }
    return C;
}

/**
 * Compute N×N correlation matrix from a T×N returns matrix.
 * @param {number[][]} returnsMatrix
 * @returns {number[][]}
 */
function correlationMatrix(returnsMatrix) {
    if (!returnsMatrix || returnsMatrix.length < 2) return [];
    const T = returnsMatrix.length;
    const N = returnsMatrix[0].length;
    const cols = [];
    for (let j = 0; j < N; j++) {
        const col = [];
        for (let i = 0; i < T; i++) col.push(returnsMatrix[i][j]);
        cols.push(col);
    }
    const R = matrixCreate(N, N);
    for (let i = 0; i < N; i++) {
        R[i][i] = 1;
        for (let j = i + 1; j < N; j++) {
            const r = correlation(cols[i], cols[j]);
            R[i][j] = r;
            R[j][i] = r;
        }
    }
    return R;
}


// ========== SECTION 3: Distribution Functions ==========

/**
 * Standard normal PDF.
 * @param {number} x
 * @returns {number}
 */
function normalPDF(x) {
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/**
 * Standard normal CDF approximation (Abramowitz & Stegun 26.2.17). Max error ~7.5e-8.
 * @param {number} x
 * @returns {number}
 */
function normalCDF(x) {
    if (x < -8) return 0;
    if (x > 8) return 1;
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
    const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    const z = Math.abs(x) / Math.sqrt(2);
    const t = 1.0 / (1.0 + p * z);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
    return 0.5 * (1.0 + sign * y);
}

/**
 * Inverse standard normal CDF (quantile function) using rational approximation.
 * Beasley-Springer-Moro algorithm.
 * @param {number} p - Probability (0, 1)
 * @returns {number}
 */
function normalInvCDF(p) {
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    if (p === 0.5) return 0;

    // Rational approximation for central region
    const a = [-3.969683028665376e1, 2.209460984245205e2,
        -2.759285104469687e2, 1.383577518672690e2,
        -3.066479806614716e1, 2.506628277459239e0];
    const b = [-5.447609879822406e1, 1.615858368580409e2,
        -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
    const c = [-7.784894002430293e-3, -3.223964580411365e-1,
        -2.400758277161838e0, -2.549732539343734e0,
        4.374664141464968e0, 2.938163982698783e0];
    const d = [7.784695709041462e-3, 3.224671290700398e-1,
        2.445134137142996e0, 3.754408661907416e0];

    const pLow = 0.02425, pHigh = 1 - pLow;
    let q, r;

    if (p < pLow) {
        q = Math.sqrt(-2 * Math.log(p));
        return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
            ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    } else if (p <= pHigh) {
        q = p - 0.5;
        r = q * q;
        return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
            (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    } else {
        q = Math.sqrt(-2 * Math.log(1 - p));
        return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
            ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
}

/**
 * Student's t-distribution CDF approximation using regularized incomplete beta function.
 * @param {number} t - t statistic
 * @param {number} df - degrees of freedom
 * @returns {number}
 */
function tDistCDF(t, df) {
    if (df <= 0) return 0.5;
    // For large df, use normal approximation
    if (df > 200) return normalCDF(t);
    const x = df / (df + t * t);
    const ibeta = regIncBeta(df / 2, 0.5, x);
    const p = 0.5 * ibeta;
    return t >= 0 ? 1 - p : p;
}

/**
 * Regularized incomplete beta function I_x(a, b) via continued fraction (Lentz).
 * @param {number} a
 * @param {number} b
 * @param {number} x
 * @returns {number}
 */
function regIncBeta(a, b, x) {
    if (x < 0 || x > 1) return 0;
    if (x === 0) return 0;
    if (x === 1) return 1;
    // Use symmetry if x > (a+1)/(a+b+2)
    if (x > (a + 1) / (a + b + 2)) {
        return 1 - regIncBeta(b, a, 1 - x);
    }
    const lnBeta = lnGamma(a) + lnGamma(b) - lnGamma(a + b);
    const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lnBeta) / a;
    // Continued fraction (Lentz's method)
    let f = 1, c = 1, d = 1 - (a + b) * x / (a + 1);
    if (Math.abs(d) < 1e-30) d = 1e-30;
    d = 1 / d;
    f = d;
    for (let i = 1; i <= 200; i++) {
        const m = i;
        // Even step
        let num = m * (b - m) * x / ((a + 2 * m - 1) * (a + 2 * m));
        d = 1 + num * d; if (Math.abs(d) < 1e-30) d = 1e-30; d = 1 / d;
        c = 1 + num / c; if (Math.abs(c) < 1e-30) c = 1e-30;
        f *= d * c;
        // Odd step
        num = -(a + m) * (a + b + m) * x / ((a + 2 * m) * (a + 2 * m + 1));
        d = 1 + num * d; if (Math.abs(d) < 1e-30) d = 1e-30; d = 1 / d;
        c = 1 + num / c; if (Math.abs(c) < 1e-30) c = 1e-30;
        const delta = d * c;
        f *= delta;
        if (Math.abs(delta - 1) < 1e-10) break;
    }
    return front * f;
}

/**
 * Log-gamma function (Lanczos approximation).
 * @param {number} z
 * @returns {number}
 */
function lnGamma(z) {
    if (z <= 0) return Infinity;
    const g = 7;
    const coef = [
        0.99999999999980993, 676.5203681218851, -1259.1392167224028,
        771.32342877765313, -176.61502916214059, 12.507343278686905,
        -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
    ];
    if (z < 0.5) {
        return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z);
    }
    z -= 1;
    let x = coef[0];
    for (let i = 1; i < g + 2; i++) x += coef[i] / (z + i);
    const t = z + g + 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

/**
 * Chi-squared CDF approximation using Wilson-Hilferty normal approximation.
 * @param {number} x - chi-squared statistic
 * @param {number} df - degrees of freedom
 * @returns {number}
 */
function chiSquaredCDF(x, df) {
    if (x <= 0 || df <= 0) return 0;
    // Wilson-Hilferty transformation
    const z = Math.pow(x / df, 1 / 3) - (1 - 2 / (9 * df));
    const denom = Math.sqrt(2 / (9 * df));
    return normalCDF(z / denom);
}


// ========== SECTION 4: OLS Regression ==========

/**
 * Ordinary Least Squares regression with full diagnostics.
 * @param {number[]} y - Dependent variable [n]
 * @param {number[][]} X - Independent variables [n × k] (without intercept column)
 * @param {Object} [options]
 * @param {boolean} [options.addIntercept=true] - Whether to prepend a column of ones
 * @param {string[]} [options.variableNames] - Names for the independent variables
 * @returns {Object} Regression results with coefficients, standard errors, t-stats, p-values, etc.
 */
function olsRegression(y, X, options) {
    const opt = Object.assign({ addIntercept: true, variableNames: null }, options || {});
    const n = y.length;

    // Build design matrix
    let Xm = [];
    for (let i = 0; i < n; i++) {
        const row = opt.addIntercept ? [1] : [];
        const xi = Array.isArray(X[i]) ? X[i] : [X[i]];
        for (let j = 0; j < xi.length; j++) row.push(xi[j]);
        Xm.push(row);
    }
    const k = Xm[0].length; // total number of params including intercept

    // y as column vector
    const yMat = y.map(v => [v]);

    // X'X
    const Xt = matrixTranspose(Xm);
    const XtX = matrixMultiply(Xt, Xm);
    let XtXinv;
    try {
        XtXinv = matrixInverse(XtX);
    } catch (e) {
        throw new Error('olsRegression: X\'X is singular, cannot compute regression');
    }

    // beta = (X'X)^-1 X'y
    const Xty = matrixMultiply(Xt, yMat);
    const betaMat = matrixMultiply(XtXinv, Xty);
    const coefficients = betaMat.map(r => r[0]);

    // Fitted values and residuals
    const fittedMat = matrixMultiply(Xm, betaMat);
    const fitted = fittedMat.map(r => r[0]);
    const residuals = [];
    for (let i = 0; i < n; i++) residuals.push(y[i] - fitted[i]);

    // RSS, TSS, ESS
    let RSS = 0;
    for (let i = 0; i < n; i++) RSS += residuals[i] * residuals[i];
    const yMean = mean(y);
    let TSS = 0, ESS = 0;
    for (let i = 0; i < n; i++) {
        TSS += (y[i] - yMean) * (y[i] - yMean);
        ESS += (fitted[i] - yMean) * (fitted[i] - yMean);
    }

    const dfResid = n - k;
    const rSquared = TSS === 0 ? 0 : 1 - RSS / TSS;
    const adjRSquared = TSS === 0 ? 0 : 1 - (1 - rSquared) * (n - 1) / (dfResid);

    // Variance of residuals
    const s2 = dfResid > 0 ? RSS / dfResid : 0;

    // Var(beta) = s^2 * (X'X)^-1
    const varBeta = matrixScale(XtXinv, s2);
    const standardErrors = [];
    const tStats = [];
    const pValues = [];
    for (let i = 0; i < k; i++) {
        const se = Math.sqrt(Math.max(0, varBeta[i][i]));
        standardErrors.push(se);
        const t = se === 0 ? 0 : coefficients[i] / se;
        tStats.push(t);
        // Two-tailed p-value from t-distribution
        const p = dfResid > 0 ? 2 * (1 - tDistCDF(Math.abs(t), dfResid)) : 1;
        pValues.push(p);
    }

    // F-statistic: (ESS / (k-1)) / (RSS / (n-k)) when intercept present
    const dfModel = opt.addIntercept ? k - 1 : k;
    const fStat = (dfModel > 0 && dfResid > 0) ? (ESS / dfModel) / (RSS / dfResid) : 0;
    // F p-value approximation via chi-squared / df
    const fPValue = fStat > 0 ? 1 - chiSquaredCDF(fStat * dfModel, dfModel) : 1;

    // Durbin-Watson
    let dwNum = 0;
    for (let i = 1; i < n; i++) {
        dwNum += Math.pow(residuals[i] - residuals[i - 1], 2);
    }
    const durbinWatson = RSS > 0 ? dwNum / RSS : 0;

    // AIC and BIC
    const aic = n > 0 ? n * Math.log(RSS / n) + 2 * k : 0;
    const bic = n > 1 ? n * Math.log(RSS / n) + k * Math.log(n) : 0;

    return {
        coefficients,
        standardErrors,
        tStats,
        pValues,
        rSquared,
        adjRSquared,
        fStat,
        fPValue,
        residuals,
        fitted,
        durbinWatson,
        aic,
        bic,
        n,
        k: dfModel
    };
}

/**
 * White's test for heteroscedasticity.
 * Regresses squared residuals on X, X^2, and cross products.
 * @param {number[]} residuals
 * @param {number[][]} X - Original design matrix (without intercept)
 * @returns {Object} { statistic, pValue, isHeteroscedastic }
 */
function heteroscedasticityTest(residuals, X) {
    const n = residuals.length;
    const sqResid = residuals.map(r => r * r);

    // Build auxiliary regressors: original vars, squared vars
    const Xaux = [];
    const kOrig = Array.isArray(X[0]) ? X[0].length : 1;
    for (let i = 0; i < n; i++) {
        const xi = Array.isArray(X[i]) ? X[i] : [X[i]];
        const row = xi.slice();
        for (let j = 0; j < kOrig; j++) row.push(xi[j] * xi[j]);
        // Cross products for multivariate
        for (let j = 0; j < kOrig; j++) {
            for (let l = j + 1; l < kOrig; l++) {
                row.push(xi[j] * xi[l]);
            }
        }
        Xaux.push(row);
    }

    try {
        const auxReg = olsRegression(sqResid, Xaux, { addIntercept: true });
        const statistic = n * auxReg.rSquared;
        const dfAux = Xaux[0].length;
        const pValue = 1 - chiSquaredCDF(statistic, dfAux);
        return { statistic, pValue, isHeteroscedastic: pValue < 0.05 };
    } catch (e) {
        return { statistic: 0, pValue: 1, isHeteroscedastic: false };
    }
}

/**
 * Jarque-Bera normality test on residuals.
 * @param {number[]} residuals
 * @returns {Object} { statistic, pValue, isNormal }
 */
function jarqueBeraTest(residuals) {
    const n = residuals.length;
    if (n < 3) return { statistic: 0, pValue: 1, isNormal: true };
    const S = skewness(residuals);
    const K = kurtosis(residuals);
    const jb = (n / 6) * (S * S + (K * K) / 4);
    const pValue = 1 - chiSquaredCDF(jb, 2);
    return { statistic: jb, pValue, isNormal: pValue >= 0.05 };
}

/**
 * Variance Inflation Factors for each column of X.
 * @param {number[][]} X - Design matrix (without intercept), n × k
 * @returns {number[]} VIF for each variable
 */
function vif(X) {
    const n = X.length;
    const k = X[0].length;
    if (k < 2) return [1];
    const vifs = [];
    for (let j = 0; j < k; j++) {
        // Regress X_j on all other X columns
        const yj = [];
        const Xother = [];
        for (let i = 0; i < n; i++) {
            yj.push(X[i][j]);
            const row = [];
            for (let l = 0; l < k; l++) {
                if (l !== j) row.push(X[i][l]);
            }
            Xother.push(row);
        }
        try {
            const reg = olsRegression(yj, Xother, { addIntercept: true });
            vifs.push(reg.rSquared >= 1 ? Infinity : 1 / (1 - reg.rSquared));
        } catch (e) {
            vifs.push(Infinity);
        }
    }
    return vifs;
}


// ========== SECTION 5: Asset Pricing Models ==========

/**
 * Calculate CAPM beta and alpha from stock and market return series.
 * @param {number[]} stockReturns
 * @param {number[]} marketReturns
 * @returns {Object} { beta, alpha, rSquared, residualVol, tStatBeta, tStatAlpha }
 */
function calculateBeta(stockReturns, marketReturns) {
    const n = Math.min(stockReturns.length, marketReturns.length);
    if (n < 3) return { beta: 0, alpha: 0, rSquared: 0, residualVol: 0, tStatBeta: 0, tStatAlpha: 0 };
    const y = stockReturns.slice(0, n);
    const X = marketReturns.slice(0, n).map(v => [v]);
    const reg = olsRegression(y, X, { addIntercept: true });
    return {
        beta: reg.coefficients[1],
        alpha: reg.coefficients[0],
        rSquared: reg.rSquared,
        residualVol: sampleStdDev(reg.residuals),
        tStatBeta: reg.tStats[1],
        tStatAlpha: reg.tStats[0]
    };
}

/**
 * CAPM expected return: E[Ri] = Rf + beta * (Rm - Rf).
 * @param {number} beta
 * @param {number} marketReturn - Expected market return
 * @param {number} riskFreeRate
 * @returns {number}
 */
function capmExpectedReturn(beta, marketReturn, riskFreeRate) {
    return riskFreeRate + beta * (marketReturn - riskFreeRate);
}

/**
 * Fama-French 3-Factor model regression.
 * @param {number[]} stockReturns
 * @param {Object} factors - { market: [], smb: [], hml: [], rf: [] }
 * @returns {Object}
 */
function famaFrench3(stockReturns, factors) {
    const n = Math.min(stockReturns.length, factors.market.length, factors.smb.length, factors.hml.length, factors.rf.length);
    const y = [];
    const X = [];
    for (let i = 0; i < n; i++) {
        y.push(stockReturns[i] - factors.rf[i]);
        X.push([factors.market[i], factors.smb[i], factors.hml[i]]);
    }
    const reg = olsRegression(y, X, { addIntercept: true, variableNames: ['Market', 'SMB', 'HML'] });
    return {
        alpha: reg.coefficients[0],
        betaMarket: reg.coefficients[1],
        betaSMB: reg.coefficients[2],
        betaHML: reg.coefficients[3],
        rSquared: reg.rSquared,
        adjRSquared: reg.adjRSquared,
        tStats: { alpha: reg.tStats[0], market: reg.tStats[1], smb: reg.tStats[2], hml: reg.tStats[3] },
        pValues: { alpha: reg.pValues[0], market: reg.pValues[1], smb: reg.pValues[2], hml: reg.pValues[3] },
        residuals: reg.residuals
    };
}

/**
 * Fama-French 5-Factor model regression.
 * @param {number[]} stockReturns
 * @param {Object} factors - { market: [], smb: [], hml: [], rmw: [], cma: [], rf: [] }
 * @returns {Object}
 */
function famaFrench5(stockReturns, factors) {
    const n = Math.min(stockReturns.length, factors.market.length, factors.smb.length,
        factors.hml.length, factors.rmw.length, factors.cma.length, factors.rf.length);
    const y = [];
    const X = [];
    for (let i = 0; i < n; i++) {
        y.push(stockReturns[i] - factors.rf[i]);
        X.push([factors.market[i], factors.smb[i], factors.hml[i], factors.rmw[i], factors.cma[i]]);
    }
    const reg = olsRegression(y, X, { addIntercept: true });
    return {
        alpha: reg.coefficients[0],
        betaMarket: reg.coefficients[1],
        betaSMB: reg.coefficients[2],
        betaHML: reg.coefficients[3],
        betaRMW: reg.coefficients[4],
        betaCMA: reg.coefficients[5],
        rSquared: reg.rSquared,
        adjRSquared: reg.adjRSquared,
        tStats: { alpha: reg.tStats[0], market: reg.tStats[1], smb: reg.tStats[2], hml: reg.tStats[3], rmw: reg.tStats[4], cma: reg.tStats[5] },
        pValues: { alpha: reg.pValues[0], market: reg.pValues[1], smb: reg.pValues[2], hml: reg.pValues[3], rmw: reg.pValues[4], cma: reg.pValues[5] },
        residuals: reg.residuals
    };
}

/**
 * Carhart 4-Factor model regression (FF3 + Momentum).
 * @param {number[]} stockReturns
 * @param {Object} factors - { market: [], smb: [], hml: [], mom: [], rf: [] }
 * @returns {Object}
 */
function carhart4(stockReturns, factors) {
    const n = Math.min(stockReturns.length, factors.market.length, factors.smb.length,
        factors.hml.length, factors.mom.length, factors.rf.length);
    const y = [];
    const X = [];
    for (let i = 0; i < n; i++) {
        y.push(stockReturns[i] - factors.rf[i]);
        X.push([factors.market[i], factors.smb[i], factors.hml[i], factors.mom[i]]);
    }
    const reg = olsRegression(y, X, { addIntercept: true });
    return {
        alpha: reg.coefficients[0],
        betaMarket: reg.coefficients[1],
        betaSMB: reg.coefficients[2],
        betaHML: reg.coefficients[3],
        betaMOM: reg.coefficients[4],
        rSquared: reg.rSquared,
        adjRSquared: reg.adjRSquared,
        tStats: { alpha: reg.tStats[0], market: reg.tStats[1], smb: reg.tStats[2], hml: reg.tStats[3], mom: reg.tStats[4] },
        pValues: { alpha: reg.pValues[0], market: reg.pValues[1], smb: reg.pValues[2], hml: reg.pValues[3], mom: reg.pValues[4] },
        residuals: reg.residuals
    };
}


// ========== SECTION 6: Risk Metrics ==========

/**
 * Parametric VaR assuming normal distribution.
 * @param {number[]} returns - Historical return series
 * @param {number} [confidence=0.95] - Confidence level (0.95 or 0.99)
 * @param {number} [horizon=1] - Time horizon in periods
 * @returns {Object} { var, method }
 */
function parametricVaR(returns, confidence, horizon) {
    if (!returns || returns.length === 0) return { var: 0, method: 'parametric' };
    confidence = confidence || 0.95;
    horizon = horizon || 1;
    const mu = mean(returns);
    const sigma = sampleStdDev(returns);
    const z = normalInvCDF(1 - confidence);
    // VaR = -(mu * horizon + z * sigma * sqrt(horizon))
    const varValue = -(mu * horizon + z * sigma * Math.sqrt(horizon));
    return { var: varValue, method: 'parametric' };
}

/**
 * Historical (empirical) VaR based on percentile of actual returns.
 * @param {number[]} returns
 * @param {number} [confidence=0.95]
 * @returns {Object} { var, method, worstLosses }
 */
function historicalVaR(returns, confidence) {
    if (!returns || returns.length === 0) return { var: 0, method: 'historical', worstLosses: [] };
    confidence = confidence || 0.95;
    const sorted = returns.slice().sort((a, b) => a - b);
    const idx = Math.floor((1 - confidence) * sorted.length);
    const varValue = -sorted[Math.max(0, idx)];
    const worstLosses = sorted.slice(0, Math.min(10, sorted.length));
    return { var: varValue, method: 'historical', worstLosses };
}

/**
 * Monte Carlo VaR using geometric Brownian motion simulation.
 * @param {number[]} returns
 * @param {number} [confidence=0.95]
 * @param {number} [simulations=10000]
 * @param {number} [horizon=1]
 * @returns {Object} { var, cvar, method, percentiles }
 */
function monteCarloVaR(returns, confidence, simulations, horizon) {
    if (!returns || returns.length === 0) {
        return { var: 0, cvar: 0, method: 'monteCarlo', percentiles: {} };
    }
    confidence = confidence || 0.95;
    simulations = simulations || 10000;
    horizon = horizon || 1;

    const mu = mean(returns);
    const sigma = sampleStdDev(returns);
    const simReturns = [];

    // Simple pseudo-random via Box-Muller (seeded by Math.random)
    for (let i = 0; i < simulations; i++) {
        let cumReturn = 0;
        for (let t = 0; t < horizon; t++) {
            // Box-Muller transform
            const u1 = Math.random() || 1e-10;
            const u2 = Math.random();
            const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            cumReturn += mu + sigma * z;
        }
        simReturns.push(cumReturn);
    }

    simReturns.sort((a, b) => a - b);
    const varIdx = Math.floor((1 - confidence) * simulations);
    const varValue = -simReturns[Math.max(0, varIdx)];

    // CVaR: mean of losses beyond VaR
    let cvarSum = 0, cvarCount = 0;
    for (let i = 0; i <= varIdx; i++) {
        cvarSum += simReturns[i];
        cvarCount++;
    }
    const cvarValue = cvarCount > 0 ? -(cvarSum / cvarCount) : varValue;

    const pctKeys = [1, 5, 10, 25, 50, 75, 90, 95, 99];
    const percentiles = {};
    for (const p of pctKeys) {
        percentiles[p] = percentile(simReturns, p);
    }

    return { var: varValue, cvar: cvarValue, method: 'monteCarlo', percentiles };
}

/**
 * Conditional VaR (Expected Shortfall): mean of losses beyond VaR threshold.
 * @param {number[]} returns
 * @param {number} [confidence=0.95]
 * @returns {Object} { cvar, var, numExceedances }
 */
function cvar(returns, confidence) {
    if (!returns || returns.length === 0) return { cvar: 0, var: 0, numExceedances: 0 };
    confidence = confidence || 0.95;
    const sorted = returns.slice().sort((a, b) => a - b);
    const cutoff = Math.floor((1 - confidence) * sorted.length);
    const numExceedances = Math.max(1, cutoff);
    const tail = sorted.slice(0, numExceedances);
    const varValue = -sorted[Math.max(0, cutoff)];
    const cvarValue = -mean(tail);
    return { cvar: cvarValue, var: varValue, numExceedances };
}

/**
 * Sortino ratio: (mean return - rf) / downside deviation.
 * @param {number[]} returns
 * @param {number} [riskFreeRate=0]
 * @param {number} [targetReturn] - Defaults to riskFreeRate
 * @returns {number}
 */
function sortinoRatio(returns, riskFreeRate, targetReturn) {
    if (!returns || returns.length === 0) return 0;
    riskFreeRate = riskFreeRate || 0;
    if (targetReturn === undefined) targetReturn = riskFreeRate;
    const dd = downsideDeviation(returns, targetReturn);
    if (dd === 0) return 0;
    return (mean(returns) - riskFreeRate) / dd;
}

/**
 * Treynor ratio: (mean return - rf) / beta.
 * @param {number[]} returns
 * @param {number[]} marketReturns
 * @param {number} [riskFreeRate=0]
 * @returns {number}
 */
function treynorRatio(returns, marketReturns, riskFreeRate) {
    riskFreeRate = riskFreeRate || 0;
    const b = calculateBeta(returns, marketReturns);
    if (b.beta === 0) return 0;
    return (mean(returns) - riskFreeRate) / b.beta;
}

/**
 * Information ratio: mean active return / tracking error.
 * @param {number[]} returns
 * @param {number[]} benchmarkReturns
 * @returns {number}
 */
function informationRatio(returns, benchmarkReturns) {
    const n = Math.min(returns.length, benchmarkReturns.length);
    if (n < 2) return 0;
    const active = [];
    for (let i = 0; i < n; i++) active.push(returns[i] - benchmarkReturns[i]);
    const te = sampleStdDev(active);
    if (te === 0) return 0;
    return mean(active) / te;
}

/**
 * Calmar ratio: annualized return / |max drawdown|.
 * @param {number[]} returns - Periodic returns
 * @param {number} [mdd] - Pre-computed max drawdown (positive number). If not given, computed from cumulative returns.
 * @returns {number}
 */
function calmarRatio(returns, mdd) {
    if (!returns || returns.length === 0) return 0;
    if (mdd === undefined) {
        // Build equity curve from returns
        const values = [1];
        for (let i = 0; i < returns.length; i++) values.push(values[values.length - 1] * (1 + returns[i]));
        mdd = maxDrawdown(values).maxDrawdown;
    }
    if (mdd === 0) return 0;
    const annReturn = mean(returns) * 252; // assume daily
    return annReturn / Math.abs(mdd);
}

/**
 * Omega ratio: probability-weighted gains over losses relative to a threshold.
 * @param {number[]} returns
 * @param {number} [threshold=0]
 * @returns {number}
 */
function omegaRatio(returns, threshold) {
    if (!returns || returns.length === 0) return 0;
    threshold = threshold || 0;
    let gains = 0, losses = 0;
    for (let i = 0; i < returns.length; i++) {
        const diff = returns[i] - threshold;
        if (diff > 0) gains += diff;
        else losses += -diff;
    }
    return losses === 0 ? Infinity : gains / losses;
}

/**
 * Annualized tracking error: std dev of active returns, annualized.
 * @param {number[]} returns
 * @param {number[]} benchmarkReturns
 * @returns {number}
 */
function trackingError(returns, benchmarkReturns) {
    const n = Math.min(returns.length, benchmarkReturns.length);
    if (n < 2) return 0;
    const active = [];
    for (let i = 0; i < n; i++) active.push(returns[i] - benchmarkReturns[i]);
    return sampleStdDev(active) * Math.sqrt(252);
}

/**
 * Maximum drawdown from a value series (prices or equity curve).
 * @param {number[]} values - Price or NAV series
 * @returns {Object} { maxDrawdown, peakIndex, troughIndex, recoveryIndex }
 */
function maxDrawdown(values) {
    if (!values || values.length < 2) return { maxDrawdown: 0, peakIndex: 0, troughIndex: 0, recoveryIndex: null };
    let peak = values[0], peakIdx = 0;
    let mdd = 0, mddPeakIdx = 0, mddTroughIdx = 0;
    for (let i = 1; i < values.length; i++) {
        if (values[i] > peak) {
            peak = values[i];
            peakIdx = i;
        }
        const dd = peak > 0 ? (peak - values[i]) / peak : 0;
        if (dd > mdd) {
            mdd = dd;
            mddPeakIdx = peakIdx;
            mddTroughIdx = i;
        }
    }
    // Find recovery (first time value >= peak after trough)
    let recoveryIndex = null;
    const peakValue = values[mddPeakIdx];
    for (let i = mddTroughIdx + 1; i < values.length; i++) {
        if (values[i] >= peakValue) {
            recoveryIndex = i;
            break;
        }
    }
    return { maxDrawdown: mdd, peakIndex: mddPeakIdx, troughIndex: mddTroughIdx, recoveryIndex };
}

/**
 * Annualized Sharpe ratio: (mean - rf) / stdDev, annualized assuming daily returns.
 * @param {number[]} returns - Periodic (daily) returns
 * @param {number} [riskFreeRate=0] - Periodic risk-free rate (same frequency as returns)
 * @returns {number}
 */
function sharpeRatio(returns, riskFreeRate) {
    if (!returns || returns.length < 2) return 0;
    riskFreeRate = riskFreeRate || 0;
    const excessReturns = returns.map(r => r - riskFreeRate);
    const sd = sampleStdDev(excessReturns);
    if (sd === 0) return 0;
    return (mean(excessReturns) / sd) * Math.sqrt(252);
}


// ========== SECTION 7: Portfolio Optimization ==========

/**
 * Solve minimum-variance portfolio for a given target return.
 * Uses analytical Lagrangian for unconstrained, projected gradient descent for constrained.
 * @param {number[][]} covMatrix - N×N covariance matrix
 * @param {number} targetReturn - Target portfolio return
 * @param {number[]} expectedReturns - N expected returns
 * @param {Object} [constraints] - { minWeight: 0, maxWeight: 1, allowShort: false }
 * @returns {Object} { weights, expectedReturn, volatility }
 */
function solveMinVariance(covMatrix, targetReturn, expectedReturns, constraints) {
    const N = covMatrix.length;
    const cons = Object.assign({ minWeight: 0, maxWeight: 1, allowShort: false }, constraints || {});
    const minW = cons.allowShort ? -1 : cons.minWeight;
    const maxW = cons.maxWeight;

    // Try analytical solution first (unconstrained Lagrangian)
    try {
        const invCov = matrixInverse(covMatrix);
        const ones = new Array(N).fill(1);

        // Compute key scalars: a = 1'Σ^-1*1, b = 1'Σ^-1*μ, c = μ'Σ^-1*μ
        let a = 0, b = 0, c = 0;
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                a += invCov[i][j];
                b += invCov[i][j] * expectedReturns[j];
                c += expectedReturns[i] * invCov[i][j] * expectedReturns[j];
            }
        }
        const det = a * c - b * b;
        if (Math.abs(det) < 1e-14) throw new Error('degenerate');

        const lambda1 = (c - b * targetReturn) / det;
        const lambda2 = (a * targetReturn - b) / det;

        const weights = [];
        let feasible = true;
        for (let i = 0; i < N; i++) {
            let w = 0;
            for (let j = 0; j < N; j++) {
                w += invCov[i][j] * (lambda1 + lambda2 * expectedReturns[j]);
            }
            if (w < minW - 1e-8 || w > maxW + 1e-8) feasible = false;
            weights.push(w);
        }

        if (feasible) {
            // Normalize weights to sum to 1
            const sumW = weights.reduce((s, w) => s + w, 0);
            for (let i = 0; i < N; i++) weights[i] /= sumW;

            const ret = weights.reduce((s, w, i) => s + w * expectedReturns[i], 0);
            let vol2 = 0;
            for (let i = 0; i < N; i++) {
                for (let j = 0; j < N; j++) {
                    vol2 += weights[i] * weights[j] * covMatrix[i][j];
                }
            }
            return { weights, expectedReturn: ret, volatility: Math.sqrt(Math.max(0, vol2)) };
        }
    } catch (e) {
        // Fall through to gradient descent
    }

    // Constrained: projected gradient descent
    let weights = new Array(N).fill(1 / N);
    const lr = 0.001;
    const iterations = 2000;

    for (let iter = 0; iter < iterations; iter++) {
        // Gradient of portfolio variance: 2 * Σ * w
        const grad = new Array(N).fill(0);
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                grad[i] += 2 * covMatrix[i][j] * weights[j];
            }
        }

        // Return constraint via penalty
        const portRet = weights.reduce((s, w, i) => s + w * expectedReturns[i], 0);
        const retPenalty = 100 * (portRet - targetReturn);
        for (let i = 0; i < N; i++) {
            grad[i] += retPenalty * expectedReturns[i];
        }

        // Update
        for (let i = 0; i < N; i++) {
            weights[i] -= lr * grad[i];
        }

        // Project onto constraints: clip to [minW, maxW] then normalize to sum=1
        for (let i = 0; i < N; i++) {
            weights[i] = Math.max(minW, Math.min(maxW, weights[i]));
        }
        const sumW = weights.reduce((s, w) => s + w, 0);
        if (sumW > 0) {
            for (let i = 0; i < N; i++) weights[i] /= sumW;
        }
    }

    const ret = weights.reduce((s, w, i) => s + w * expectedReturns[i], 0);
    let vol2 = 0;
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            vol2 += weights[i] * weights[j] * covMatrix[i][j];
        }
    }
    return { weights, expectedReturn: ret, volatility: Math.sqrt(Math.max(0, vol2)) };
}

/**
 * Generate portfolios along the efficient frontier.
 * @param {number[]} expectedReturns - N expected returns
 * @param {number[][]} covMatrix - N×N covariance matrix
 * @param {number} [numPoints=20] - Number of frontier points
 * @param {Object} [constraints] - { minWeight: 0, maxWeight: 1, allowShort: false }
 * @returns {Object[]} Array of { weights, expectedReturn, volatility, sharpe }
 */
function efficientFrontier(expectedReturns, covMatrix, numPoints, constraints) {
    numPoints = numPoints || 20;
    const minRet = Math.min(...expectedReturns);
    const maxRet = Math.max(...expectedReturns);
    const step = (maxRet - minRet) / (numPoints - 1);
    const frontier = [];
    for (let i = 0; i < numPoints; i++) {
        const target = minRet + i * step;
        const port = solveMinVariance(covMatrix, target, expectedReturns, constraints);
        const sharpe = port.volatility > 0 ? port.expectedReturn / port.volatility : 0;
        frontier.push({
            weights: port.weights,
            expectedReturn: port.expectedReturn,
            volatility: port.volatility,
            sharpe
        });
    }
    return frontier;
}

/**
 * Global minimum variance portfolio.
 * @param {number[][]} covMatrix - N×N covariance matrix
 * @param {Object} [constraints]
 * @returns {Object} { weights, expectedReturn, volatility }
 */
function minimumVariancePortfolio(covMatrix, constraints) {
    const N = covMatrix.length;
    // For min-variance, set all expected returns equal so target return is irrelevant
    const dummyReturns = new Array(N).fill(0);
    return solveMinVariance(covMatrix, 0, dummyReturns, constraints);
}

/**
 * Tangency (maximum Sharpe ratio) portfolio.
 * @param {number[]} expectedReturns
 * @param {number[][]} covMatrix
 * @param {number} riskFreeRate
 * @param {Object} [constraints]
 * @returns {Object} { weights, expectedReturn, volatility, sharpe }
 */
function tangencyPortfolio(expectedReturns, covMatrix, riskFreeRate, constraints) {
    const N = expectedReturns.length;
    const cons = Object.assign({ minWeight: 0, maxWeight: 1, allowShort: false }, constraints || {});

    // Analytical: w* = Σ^-1(μ - rf) / 1'Σ^-1(μ - rf)
    try {
        const invCov = matrixInverse(covMatrix);
        const excessReturns = expectedReturns.map(r => r - riskFreeRate);
        const rawWeights = [];
        for (let i = 0; i < N; i++) {
            let w = 0;
            for (let j = 0; j < N; j++) w += invCov[i][j] * excessReturns[j];
            rawWeights.push(w);
        }
        const sumW = rawWeights.reduce((s, w) => s + w, 0);
        if (Math.abs(sumW) < 1e-14) throw new Error('degenerate');
        const weights = rawWeights.map(w => w / sumW);

        const minW = cons.allowShort ? -1 : cons.minWeight;
        let feasible = true;
        for (let i = 0; i < N; i++) {
            if (weights[i] < minW - 1e-8 || weights[i] > cons.maxWeight + 1e-8) feasible = false;
        }
        if (feasible) {
            const ret = weights.reduce((s, w, i) => s + w * expectedReturns[i], 0);
            let vol2 = 0;
            for (let i = 0; i < N; i++) {
                for (let j = 0; j < N; j++) vol2 += weights[i] * weights[j] * covMatrix[i][j];
            }
            const vol = Math.sqrt(Math.max(0, vol2));
            return { weights, expectedReturn: ret, volatility: vol, sharpe: vol > 0 ? (ret - riskFreeRate) / vol : 0 };
        }
    } catch (e) {
        // Fall through
    }

    // Constrained: search efficient frontier for max Sharpe
    const frontier = efficientFrontier(expectedReturns, covMatrix, 50, constraints);
    let best = frontier[0];
    let bestSharpe = -Infinity;
    for (const p of frontier) {
        const s = p.volatility > 0 ? (p.expectedReturn - riskFreeRate) / p.volatility : 0;
        if (s > bestSharpe) {
            bestSharpe = s;
            best = p;
        }
    }
    return { weights: best.weights, expectedReturn: best.expectedReturn, volatility: best.volatility, sharpe: bestSharpe };
}

/**
 * Risk parity portfolio: equal risk contribution from each asset.
 * Uses iterative Newton-Raphson to equalize marginal risk contributions.
 * @param {number[][]} covMatrix - N×N covariance matrix
 * @returns {Object} { weights, riskContributions }
 */
function riskParityPortfolio(covMatrix) {
    const N = covMatrix.length;
    let weights = new Array(N).fill(1 / N);
    const targetRC = 1 / N;
    const iterations = 500;

    for (let iter = 0; iter < iterations; iter++) {
        // Portfolio variance = w' Σ w
        let portVar = 0;
        const sigmaW = new Array(N).fill(0); // Σ * w
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                sigmaW[i] += covMatrix[i][j] * weights[j];
                portVar += weights[i] * covMatrix[i][j] * weights[j];
            }
        }
        const portVol = Math.sqrt(Math.max(0, portVar));
        if (portVol === 0) break;

        // Marginal risk contribution: MRC_i = (Σw)_i / σ_p
        // Risk contribution: RC_i = w_i * MRC_i / σ_p = w_i * (Σw)_i / σ_p^2
        const rc = [];
        for (let i = 0; i < N; i++) {
            rc.push(weights[i] * sigmaW[i] / portVar);
        }

        // Update: w_i *= (targetRC / rc_i)
        for (let i = 0; i < N; i++) {
            if (rc[i] > 1e-12) {
                weights[i] *= Math.pow(targetRC / rc[i], 0.5);
            }
        }
        // Normalize
        const sumW = weights.reduce((s, w) => s + w, 0);
        for (let i = 0; i < N; i++) weights[i] /= sumW;
    }

    // Final risk contributions
    let portVar = 0;
    const sigmaW = new Array(N).fill(0);
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            sigmaW[i] += covMatrix[i][j] * weights[j];
            portVar += weights[i] * covMatrix[i][j] * weights[j];
        }
    }
    const riskContributions = [];
    for (let i = 0; i < N; i++) {
        riskContributions.push(portVar > 0 ? weights[i] * sigmaW[i] / portVar : 1 / N);
    }

    return { weights, riskContributions };
}


// ========== SECTION 8: Valuation Models ==========

/**
 * Discounted Cash Flow (DCF) valuation.
 * @param {number[]} freeCashFlows - Projected free cash flows (years 1 to N)
 * @param {number} wacc - Weighted average cost of capital
 * @param {number} terminalGrowthRate - Perpetual growth rate for terminal value
 * @param {number} sharesOutstanding
 * @returns {Object} { enterpriseValue, equityValue, pricePerShare, pvOfCashFlows, pvOfTerminal, terminalValue }
 */
function dcf(freeCashFlows, wacc, terminalGrowthRate, sharesOutstanding) {
    if (!freeCashFlows || freeCashFlows.length === 0 || wacc <= terminalGrowthRate) {
        return { enterpriseValue: 0, equityValue: 0, pricePerShare: 0, pvOfCashFlows: [], pvOfTerminal: 0, terminalValue: 0 };
    }
    const pvOfCashFlows = [];
    let sumPV = 0;
    for (let i = 0; i < freeCashFlows.length; i++) {
        const pv = freeCashFlows[i] / Math.pow(1 + wacc, i + 1);
        pvOfCashFlows.push(pv);
        sumPV += pv;
    }
    const lastFCF = freeCashFlows[freeCashFlows.length - 1];
    const terminalValue = (lastFCF * (1 + terminalGrowthRate)) / (wacc - terminalGrowthRate);
    const pvOfTerminal = terminalValue / Math.pow(1 + wacc, freeCashFlows.length);
    const enterpriseValue = sumPV + pvOfTerminal;
    const equityValue = enterpriseValue; // Simplified; in practice subtract net debt
    const pricePerShare = sharesOutstanding > 0 ? equityValue / sharesOutstanding : 0;
    return { enterpriseValue, equityValue, pricePerShare, pvOfCashFlows, pvOfTerminal, terminalValue };
}

/**
 * Gordon Growth Dividend Discount Model: P = D0*(1+g) / (r-g).
 * @param {number} currentDividend - Most recent dividend (D0)
 * @param {number} growthRate - Perpetual growth rate
 * @param {number} requiredReturn - Required rate of return
 * @returns {Object} { fairValue, impliedYield, impliedGrowth }
 */
function gordonGrowthDDM(currentDividend, growthRate, requiredReturn) {
    if (requiredReturn <= growthRate) return { fairValue: Infinity, impliedYield: 0, impliedGrowth: growthRate };
    const d1 = currentDividend * (1 + growthRate);
    const fairValue = d1 / (requiredReturn - growthRate);
    const impliedYield = fairValue > 0 ? d1 / fairValue : 0;
    return { fairValue, impliedYield, impliedGrowth: growthRate };
}

/**
 * Multi-stage Dividend Discount Model.
 * @param {Object[]} stages - [{ years, growthRate }, ...]. Last stage is terminal (no 'years' needed).
 * @param {number} requiredReturn
 * @returns {Object} { fairValue, pvByStage, terminalValue }
 */
function multiStageDDM(stages, requiredReturn) {
    if (!stages || stages.length === 0) return { fairValue: 0, pvByStage: [], terminalValue: 0 };

    // Assume D0 = 1 (caller can scale)
    let dividend = 1;
    let totalPV = 0;
    let period = 0;
    const pvByStage = [];

    for (let s = 0; s < stages.length; s++) {
        const stage = stages[s];
        const isTerminal = s === stages.length - 1;

        if (isTerminal) {
            // Gordon Growth on the last dividend
            const d1 = dividend * (1 + stage.growthRate);
            if (requiredReturn <= stage.growthRate) {
                pvByStage.push(Infinity);
                return { fairValue: Infinity, pvByStage, terminalValue: Infinity };
            }
            const tv = d1 / (requiredReturn - stage.growthRate);
            const pvTV = tv / Math.pow(1 + requiredReturn, period);
            pvByStage.push(pvTV);
            totalPV += pvTV;
        } else {
            let stagePV = 0;
            for (let y = 0; y < stage.years; y++) {
                dividend *= (1 + stage.growthRate);
                period++;
                const pv = dividend / Math.pow(1 + requiredReturn, period);
                stagePV += pv;
            }
            pvByStage.push(stagePV);
            totalPV += stagePV;
        }
    }

    return { fairValue: totalPV, pvByStage, terminalValue: pvByStage[pvByStage.length - 1] };
}

/**
 * Residual Income Model valuation.
 * @param {number} bookValue - Current book value per share
 * @param {number} roe - Return on equity
 * @param {number} costOfEquity - Required return on equity
 * @param {number} [fadeYears=10] - Years of abnormal returns
 * @param {number} [terminalROE] - Long-term ROE (defaults to costOfEquity)
 * @returns {Object} { intrinsicValue, pvResidualIncome, terminalValue }
 */
function residualIncome(bookValue, roe, costOfEquity, fadeYears, terminalROE) {
    fadeYears = fadeYears || 10;
    terminalROE = terminalROE !== undefined ? terminalROE : costOfEquity;

    let bv = bookValue;
    let totalPV = 0;
    const pvRI = [];

    for (let t = 1; t <= fadeYears; t++) {
        // Linearly fade ROE toward terminalROE
        const currentROE = roe + (terminalROE - roe) * ((t - 1) / fadeYears);
        const ri = (currentROE - costOfEquity) * bv;
        const pv = ri / Math.pow(1 + costOfEquity, t);
        pvRI.push(pv);
        totalPV += pv;
        // Retain earnings: BV grows by ROE * BV (simplified, assumes 100% retention)
        bv *= (1 + currentROE);
    }

    // Terminal RI (perpetuity of the last RI if ROE > cost of equity)
    const termRI = (terminalROE - costOfEquity) * bv;
    const terminalValue = costOfEquity > 0 ? (termRI / costOfEquity) / Math.pow(1 + costOfEquity, fadeYears) : 0;

    return { intrinsicValue: bookValue + totalPV + terminalValue, pvResidualIncome: pvRI, terminalValue };
}

/**
 * DCF sensitivity matrix: values across a grid of WACC and terminal growth rates.
 * @param {number[]} baseFCFs - Base free cash flows
 * @param {number[]} waccRange - Array of WACC values to test
 * @param {number[]} growthRange - Array of growth rate values to test
 * @param {number} sharesOutstanding
 * @returns {Object} { matrix, waccValues, growthValues }
 */
function dcfSensitivity(baseFCFs, waccRange, growthRange, sharesOutstanding) {
    const matrix = [];
    for (let i = 0; i < waccRange.length; i++) {
        const row = [];
        for (let j = 0; j < growthRange.length; j++) {
            const result = dcf(baseFCFs, waccRange[i], growthRange[j], sharesOutstanding);
            row.push(result.pricePerShare);
        }
        matrix.push(row);
    }
    return { matrix, waccValues: waccRange, growthValues: growthRange };
}


// ========== SECTION 9: Scoring Models ==========

/**
 * Altman Z-Score for public manufacturing companies.
 * Z = 1.2*X1 + 1.4*X2 + 3.3*X3 + 0.6*X4 + 1.0*X5
 * @param {Object} data
 * @returns {Object} { zScore, zone, components, thresholds }
 */
function altmanZScore(data) {
    const { workingCapital, retainedEarnings, ebit, marketCap, totalDebt, totalAssets, sales } = data;
    if (!totalAssets || totalAssets === 0) return { zScore: 0, zone: 'distress', components: {}, thresholds: {} };

    const X1 = workingCapital / totalAssets;
    const X2 = retainedEarnings / totalAssets;
    const X3 = ebit / totalAssets;
    const X4 = totalDebt > 0 ? marketCap / totalDebt : 10; // Cap if no debt
    const X5 = sales / totalAssets;

    const zScore = 1.2 * X1 + 1.4 * X2 + 3.3 * X3 + 0.6 * X4 + 1.0 * X5;
    let zone = 'distress';
    if (zScore > 2.99) zone = 'safe';
    else if (zScore >= 1.81) zone = 'grey';

    return {
        zScore,
        zone,
        components: { X1, X2, X3, X4, X5 },
        thresholds: { safe: 2.99, grey: 1.81, distress: 1.81 }
    };
}

/**
 * Altman Z''-Score for emerging markets.
 * Z'' = 3.25 + 6.56*X1 + 3.26*X2 + 6.72*X3 + 1.05*X4
 * @param {Object} data
 * @returns {Object} { zScore, zone, components, thresholds }
 */
function altmanZScoreEM(data) {
    const { workingCapital, retainedEarnings, ebit, marketCap, totalDebt, totalAssets } = data;
    if (!totalAssets || totalAssets === 0) return { zScore: 0, zone: 'distress', components: {}, thresholds: {} };

    const X1 = workingCapital / totalAssets;
    const X2 = retainedEarnings / totalAssets;
    const X3 = ebit / totalAssets;
    const X4 = totalDebt > 0 ? marketCap / totalDebt : 10;

    const zScore = 3.25 + 6.56 * X1 + 3.26 * X2 + 6.72 * X3 + 1.05 * X4;
    let zone = 'distress';
    if (zScore > 2.60) zone = 'safe';
    else if (zScore >= 1.10) zone = 'grey';

    return {
        zScore,
        zone,
        components: { X1, X2, X3, X4 },
        thresholds: { safe: 2.60, grey: 1.10, distress: 1.10 }
    };
}

/**
 * Piotroski F-Score (0-9): financial strength indicator.
 * @param {Object} data
 * @returns {Object} { fScore, components }
 */
function piotroskiFScore(data) {
    const profitability = [];
    const leverage = [];
    const efficiency = [];

    // Profitability (4 points)
    profitability.push({ name: 'Positive Net Income', score: data.netIncome > 0 ? 1 : 0 });
    profitability.push({ name: 'Positive Operating Cash Flow', score: data.operatingCashFlow > 0 ? 1 : 0 });
    profitability.push({ name: 'ROA Improving', score: data.roa > data.roaPrior ? 1 : 0 });
    profitability.push({ name: 'Cash Flow > Net Income', score: data.operatingCashFlow > data.netIncome ? 1 : 0 });

    // Leverage (3 points)
    leverage.push({ name: 'Decreasing Long-term Debt', score: data.longTermDebt < data.longTermDebtPrior ? 1 : 0 });
    leverage.push({ name: 'Improving Current Ratio', score: data.currentRatio > data.currentRatioPrior ? 1 : 0 });
    leverage.push({ name: 'No New Shares Issued', score: data.sharesOutstanding <= data.sharesOutstandingPrior ? 1 : 0 });

    // Efficiency (2 points)
    efficiency.push({ name: 'Improving Gross Margin', score: data.grossMargin > data.grossMarginPrior ? 1 : 0 });
    efficiency.push({ name: 'Improving Asset Turnover', score: data.assetTurnover > data.assetTurnoverPrior ? 1 : 0 });

    const fScore = [...profitability, ...leverage, ...efficiency].reduce((s, c) => s + c.score, 0);
    return { fScore, components: { profitability, leverage, efficiency } };
}

/**
 * Beneish M-Score: earnings manipulation detector.
 * M = -4.84 + 0.92*DSRI + 0.528*GMI + 0.404*AQI + 0.892*SGI + 0.115*DEPI - 0.172*SGAI + 4.679*TATA - 0.327*LVGI
 * @param {Object} data
 * @returns {Object} { mScore, isManipulator, components }
 */
function beneishMScore(data) {
    const safeDiv = (a, b) => (b === 0 || !isFinite(a / b)) ? 0 : a / b;

    // Days Sales in Receivables Index
    const DSRI = safeDiv(data.receivables / data.sales, data.receivablesPrior / data.salesPrior);

    // Gross Margin Index
    const gmCurrent = (data.sales - data.cogs) / data.sales;
    const gmPrior = (data.salesPrior - data.cogsPrior) / data.salesPrior;
    const GMI = safeDiv(gmPrior, gmCurrent);

    // Asset Quality Index
    const aqCurrent = 1 - (data.ppe + (data.totalAssets - data.longTermAssets)) / data.totalAssets;
    const aqPrior = 1 - (data.ppePrior + (data.totalAssetsPrior - data.longTermAssetsPrior)) / data.totalAssetsPrior;
    const AQI = safeDiv(aqCurrent, aqPrior);

    // Sales Growth Index
    const SGI = safeDiv(data.sales, data.salesPrior);

    // Depreciation Index
    const depRateCurrent = safeDiv(data.depreciation, data.depreciation + data.ppe);
    const depRatePrior = safeDiv(data.depreciationPrior, data.depreciationPrior + data.ppePrior);
    const DEPI = safeDiv(depRatePrior, depRateCurrent);

    // SGA Index
    const sgaCurrent = safeDiv(data.sga, data.sales);
    const sgaPrior = safeDiv(data.sgaPrior, data.salesPrior);
    const SGAI = safeDiv(sgaCurrent, sgaPrior);

    // Total Accruals to Total Assets
    const TATA = safeDiv(data.netIncome - data.operatingCashFlow, data.totalAssets);

    // Leverage Index
    const levCurrent = safeDiv(data.longTermAssets, data.totalAssets); // simplified
    const levPrior = safeDiv(data.longTermAssetsPrior, data.totalAssetsPrior);
    const LVGI = safeDiv(levCurrent, levPrior);

    const mScore = -4.84 + 0.92 * DSRI + 0.528 * GMI + 0.404 * AQI + 0.892 * SGI +
        0.115 * DEPI - 0.172 * SGAI + 4.679 * TATA - 0.327 * LVGI;

    return {
        mScore,
        isManipulator: mScore > -1.78,
        components: { DSRI, GMI, AQI, SGI, DEPI, SGAI, TATA, LVGI }
    };
}

/**
 * 3-component DuPont analysis.
 * ROE = Net Margin x Asset Turnover x Equity Multiplier
 * @param {number} netIncome
 * @param {number} revenue
 * @param {number} totalAssets
 * @param {number} totalEquity
 * @returns {Object}
 */
function dupontAnalysis3(netIncome, revenue, totalAssets, totalEquity) {
    const netMargin = revenue !== 0 ? netIncome / revenue : 0;
    const assetTurnover = totalAssets !== 0 ? revenue / totalAssets : 0;
    const equityMultiplier = totalEquity !== 0 ? totalAssets / totalEquity : 0;
    const roe = netMargin * assetTurnover * equityMultiplier;
    return { roe, netMargin, assetTurnover, equityMultiplier };
}

/**
 * 5-component DuPont analysis.
 * ROE = Tax Burden x Interest Burden x EBIT Margin x Asset Turnover x Equity Multiplier
 * @param {number} ebit
 * @param {number} revenue
 * @param {number} totalAssets
 * @param {number} totalEquity
 * @param {number} interestExpense
 * @param {number} taxRate
 * @param {number} pretaxIncome
 * @returns {Object}
 */
function dupontAnalysis5(ebit, revenue, totalAssets, totalEquity, interestExpense, taxRate, pretaxIncome) {
    const taxBurden = 1 - taxRate;
    const interestBurden = ebit !== 0 ? pretaxIncome / ebit : 0;
    const ebitMargin = revenue !== 0 ? ebit / revenue : 0;
    const assetTurnover = totalAssets !== 0 ? revenue / totalAssets : 0;
    const equityMultiplier = totalEquity !== 0 ? totalAssets / totalEquity : 0;
    const roe = taxBurden * interestBurden * ebitMargin * assetTurnover * equityMultiplier;
    return { roe, taxBurden, interestBurden, ebitMargin, assetTurnover, equityMultiplier };
}


// ========== SECTION 10: Cross-Sectional Regression ==========

/**
 * Fama-MacBeth cross-sectional regression.
 * For each date, regresses returns on firm characteristics. Then averages coefficients
 * across time and computes Fama-MacBeth t-statistics.
 * @param {Object[]} returns - [{ date, company, return }]
 * @param {Object[]} characteristics - [{ date, company, ...charFields }]
 * @returns {Object} { timeSeries, averageCoefficients, fmTStats }
 */
function crossSectionalRegression(returns, characteristics) {
    // Group by date
    const returnsByDate = {};
    for (const r of returns) {
        if (!returnsByDate[r.date]) returnsByDate[r.date] = {};
        returnsByDate[r.date][r.company] = r.return;
    }
    const charsByDate = {};
    for (const c of characteristics) {
        if (!charsByDate[c.date]) charsByDate[c.date] = {};
        charsByDate[c.date][c.company] = c;
    }

    const dates = Object.keys(returnsByDate).filter(d => charsByDate[d]).sort();
    if (dates.length === 0) return { timeSeries: [], averageCoefficients: {}, fmTStats: {} };

    // Identify characteristic field names (exclude 'date' and 'company')
    const sampleChar = characteristics[0];
    const charNames = Object.keys(sampleChar).filter(k => k !== 'date' && k !== 'company');

    const timeSeries = [];
    const allCoefs = {}; // charName -> [coef values across time]
    for (const name of charNames) allCoefs[name] = [];
    allCoefs['intercept'] = [];

    for (const date of dates) {
        const rets = returnsByDate[date];
        const chars = charsByDate[date];
        const companies = Object.keys(rets).filter(c => chars[c]);
        if (companies.length < charNames.length + 2) continue; // need more obs than params

        const y = [];
        const X = [];
        for (const co of companies) {
            y.push(rets[co]);
            const row = [];
            for (const name of charNames) {
                row.push(chars[co][name] || 0);
            }
            X.push(row);
        }

        try {
            const reg = olsRegression(y, X, { addIntercept: true });
            const entry = { date, coefficients: {}, rSquared: reg.rSquared };
            entry.coefficients['intercept'] = reg.coefficients[0];
            allCoefs['intercept'].push(reg.coefficients[0]);
            for (let i = 0; i < charNames.length; i++) {
                entry.coefficients[charNames[i]] = reg.coefficients[i + 1];
                allCoefs[charNames[i]].push(reg.coefficients[i + 1]);
            }
            timeSeries.push(entry);
        } catch (e) {
            // Skip dates where regression fails
        }
    }

    // Fama-MacBeth: average coefficients and t-stats
    const averageCoefficients = {};
    const fmTStats = {};
    const allNames = ['intercept', ...charNames];
    for (const name of allNames) {
        const vals = allCoefs[name];
        if (vals.length === 0) {
            averageCoefficients[name] = { mean: 0, tStat: 0, pValue: 1 };
            fmTStats[name] = 0;
            continue;
        }
        const m = mean(vals);
        const se = sampleStdDev(vals) / Math.sqrt(vals.length);
        const t = se > 0 ? m / se : 0;
        const p = vals.length > 2 ? 2 * (1 - tDistCDF(Math.abs(t), vals.length - 1)) : 1;
        averageCoefficients[name] = { mean: m, tStat: t, pValue: p };
        fmTStats[name] = t;
    }

    return { timeSeries, averageCoefficients, fmTStats };
}


// ========== SECTION 11: Vision 2030 Diversification Scoring ==========

/**
 * Vision 2030 Diversification Score (0–100).
 * 4 components: Sector Alignment (30), Financial Resilience (25),
 * Growth Momentum (25), Country Vision Alignment (20).
 * @param {Object} data
 * @returns {Object} { totalScore, rating, components }
 */
function vision2030Score(data) {
    var sector = data.sector || '';
    var country = data.country || '';

    // --- Component 1: Sector Alignment (0-30) ---
    var VISION_SECTORS = {
        'Information Technology': 30, 'Healthcare': 28,
        'Consumer Discretionary': 22, 'Communication Services': 20,
        'Financials': 18, 'Industrials': 16, 'Materials': 14,
        'Consumer Staples': 12, 'Real Estate': 12,
        'Utilities': 10, 'Energy': 8
    };
    var sectorScore = VISION_SECTORS[sector] || 10;

    // --- Component 2: Financial Resilience (0-25) ---
    var crScore = 0;
    var cr = data.currentRatio || 0;
    if (cr >= 2.0) crScore = 8;
    else if (cr >= 1.5) crScore = 6;
    else if (cr >= 1.0) crScore = 4;
    else crScore = 2;

    var deScore = 0;
    var de = data.debtToEquity || 0;
    if (de <= 0.3) deScore = 8;
    else if (de <= 0.6) deScore = 6;
    else if (de <= 1.0) deScore = 4;
    else if (de <= 1.5) deScore = 2;
    else deScore = 1;

    var fcfScore = (data.freeCashFlow || 0) > 0 ? 5 : 1;

    var roaScore = 0;
    var roa = data.roa || 0;
    if (roa >= 10) roaScore = 4;
    else if (roa >= 5) roaScore = 3;
    else if (roa >= 2) roaScore = 2;
    else roaScore = 1;

    var resilienceScore = crScore + deScore + fcfScore + roaScore;

    // --- Component 3: Growth Momentum (0-25) ---
    var rgScore = 0;
    var rg = data.revenueGrowth || 0;
    if (rg >= 20) rgScore = 12;
    else if (rg >= 10) rgScore = 9;
    else if (rg >= 5) rgScore = 6;
    else if (rg >= 0) rgScore = 3;
    else rgScore = 1;

    var roeScore = 0;
    var roe = data.roe || 0;
    if (roe >= 20) roeScore = 8;
    else if (roe >= 12) roeScore = 6;
    else if (roe >= 5) roeScore = 4;
    else roeScore = 2;

    var divScore = 0;
    var dy = data.dividendYield || 0;
    if (dy >= 2 && dy <= 5) divScore = 5;  // Balanced
    else if (dy > 5) divScore = 3;          // High payout, less reinvestment
    else if (dy > 0) divScore = 3;          // Low but present
    else divScore = 1;

    var growthScore = rgScore + roeScore + divScore;

    // --- Component 4: Country Vision Alignment (0-20) ---
    var COUNTRY_SCORES = {
        'UAE': 18, 'Saudi Arabia': 16, 'Qatar': 15,
        'Bahrain': 14, 'Oman': 13, 'Kuwait': 12
    };
    var countryScore = COUNTRY_SCORES[country] || 10;

    // --- Total ---
    var totalScore = sectorScore + resilienceScore + growthScore + countryScore;
    totalScore = Math.min(100, Math.max(0, totalScore));

    var rating = 'Lagging';
    if (totalScore >= 80) rating = 'Leader';
    else if (totalScore >= 60) rating = 'Aligned';
    else if (totalScore >= 40) rating = 'Transitioning';

    return {
        totalScore: Math.round(totalScore * 10) / 10,
        rating: rating,
        components: {
            sectorAlignment: { score: sectorScore, maxScore: 30, details: sector },
            financialResilience: { score: resilienceScore, maxScore: 25, details: { currentRatio: crScore, debtToEquity: deScore, fcf: fcfScore, roa: roaScore } },
            growthMomentum: { score: growthScore, maxScore: 25, details: { revenueGrowth: rgScore, roe: roeScore, dividendYield: divScore } },
            countryVision: { score: countryScore, maxScore: 20, details: country }
        }
    };
}


// ========== SECTION 12: Cross-GCC Relative Value Analysis ==========

/**
 * Cross-GCC Relative Value Scanner.
 * Identifies cross-market mispricing by comparing same-sector companies
 * across GCC countries using valuation multiples, factor-adjusted spreads,
 * and country risk decomposition.
 *
 * @param {Object[]} companiesData - Array of { symbol, name, country, sector,
 *   peRatio, priceToBook, roe, dividendYield, debtToEquity, revenueGrowth }
 * @returns {Object} { sectorAnalysis, topOpportunities, totalSectors, totalPairsAnalyzed }
 */
function gccRelativeValue(companiesData) {
    // Country risk premium — justified PE differential (points)
    var COUNTRY_RISK_PE = {
        'UAE': 0, 'Saudi Arabia': 0.5, 'Qatar': 1.0,
        'Kuwait': 1.5, 'Bahrain': 2.0, 'Oman': 2.5
    };

    function med(arr) {
        if (!arr || arr.length === 0) return 0;
        var s = arr.slice().sort(function(a, b) { return a - b; });
        var m = Math.floor(s.length / 2);
        return s.length % 2 !== 0 ? s[m] : (s[m - 1] + s[m]) / 2;
    }

    function r1(v) { return Math.round(v * 10) / 10; }

    // 1. Group by sector
    var sectors = {};
    companiesData.forEach(function(c) {
        if (!sectors[c.sector]) sectors[c.sector] = [];
        sectors[c.sector].push(c);
    });

    var sectorAnalysis = {};
    var allPairs = [];

    Object.keys(sectors).forEach(function(sectorName) {
        var group = sectors[sectorName];
        if (group.length < 2) return;

        // 2. Sector medians
        var peVals = group.map(function(c) { return c.peRatio; }).filter(function(v) { return v > 0; });
        var pbVals = group.map(function(c) { return c.priceToBook; }).filter(function(v) { return v > 0; });
        var roeVals = group.map(function(c) { return c.roe; });
        var dyVals = group.map(function(c) { return c.dividendYield; });

        var sectorMedian = {
            pe: r1(med(peVals)),
            pb: r1(med(pbVals)),
            roe: r1(med(roeVals)),
            dy: r1(med(dyVals))
        };

        // 3. Country-level medians
        var byCountry = {};
        group.forEach(function(c) {
            if (!byCountry[c.country]) byCountry[c.country] = [];
            byCountry[c.country].push(c);
        });
        var countryMedians = {};
        Object.keys(byCountry).forEach(function(country) {
            var cg = byCountry[country];
            countryMedians[country] = {
                pe: r1(med(cg.map(function(c) { return c.peRatio; }).filter(function(v) { return v > 0; }))),
                pb: r1(med(cg.map(function(c) { return c.priceToBook; }).filter(function(v) { return v > 0; }))),
                roe: r1(med(cg.map(function(c) { return c.roe; }))),
                dy: r1(med(cg.map(function(c) { return c.dividendYield; }))),
                count: cg.length
            };
        });

        // 4. Per-company relative value score
        group.forEach(function(c) {
            var peD = sectorMedian.pe > 0 ? ((c.peRatio - sectorMedian.pe) / sectorMedian.pe) * 100 : 0;
            var pbD = sectorMedian.pb > 0 ? ((c.priceToBook - sectorMedian.pb) / sectorMedian.pb) * 100 : 0;
            var roeD = Math.abs(sectorMedian.roe) > 0 ? ((c.roe - sectorMedian.roe) / Math.abs(sectorMedian.roe)) * 100 : 0;
            var dyD = sectorMedian.dy > 0 ? ((c.dividendYield - sectorMedian.dy) / sectorMedian.dy) * 100 : 0;

            // Composite: positive = undervalued (cheap PE/PB, high ROE/DY)
            var composite = r1(
                (-peD * 0.35) + (-pbD * 0.25) + (roeD * 0.25) + (dyD * 0.15)
            );

            var signal = 'Fair Value';
            if (composite >= 20) signal = 'Strong Buy';
            else if (composite >= 10) signal = 'Buy';
            else if (composite <= -20) signal = 'Very Expensive';
            else if (composite <= -10) signal = 'Expensive';

            c.relativeValue = {
                peDeviation: r1(peD),
                pbDeviation: r1(pbD),
                roeDeviation: r1(roeD),
                dyDeviation: r1(dyD),
                compositeScore: composite,
                signal: signal
            };
        });

        // Sort by composite (most undervalued first)
        group.sort(function(a, b) { return b.relativeValue.compositeScore - a.relativeValue.compositeScore; });

        // 5. Cross-country pairs: for each pair of countries, match cheapest vs most expensive
        var countries = Object.keys(byCountry);
        if (countries.length >= 2) {
            for (var i = 0; i < countries.length; i++) {
                for (var j = i + 1; j < countries.length; j++) {
                    var g1 = byCountry[countries[i]].slice().sort(function(a, b) {
                        return b.relativeValue.compositeScore - a.relativeValue.compositeScore;
                    });
                    var g2 = byCountry[countries[j]].slice().sort(function(a, b) {
                        return b.relativeValue.compositeScore - a.relativeValue.compositeScore;
                    });
                    // Cheapest of g1 vs most expensive of g2
                    var cheap = g1[0];
                    var expensive = g2[g2.length - 1];
                    if (cheap.relativeValue.compositeScore < expensive.relativeValue.compositeScore) {
                        var tmp = cheap; cheap = expensive; expensive = tmp;
                    }
                    var peSpread = Math.abs(expensive.peRatio - cheap.peRatio);
                    var riskAdj = Math.abs((COUNTRY_RISK_PE[expensive.country] || 0) - (COUNTRY_RISK_PE[cheap.country] || 0));
                    allPairs.push({
                        sector: sectorName,
                        cheap: { symbol: cheap.symbol, name: cheap.name, country: cheap.country, pe: cheap.peRatio, pb: cheap.priceToBook, roe: cheap.roe, compositeScore: cheap.relativeValue.compositeScore },
                        expensive: { symbol: expensive.symbol, name: expensive.name, country: expensive.country, pe: expensive.peRatio, pb: expensive.priceToBook, roe: expensive.roe, compositeScore: expensive.relativeValue.compositeScore },
                        peSpread: r1(peSpread),
                        countryRiskAdjustment: r1(riskAdj),
                        pureMispricing: r1(Math.max(0, peSpread - riskAdj)),
                        compositeSpread: r1(cheap.relativeValue.compositeScore - expensive.relativeValue.compositeScore)
                    });
                }
            }
        }

        sectorAnalysis[sectorName] = {
            companyCount: group.length,
            countryCount: countries.length,
            sectorMedian: sectorMedian,
            countryMedians: countryMedians,
            companies: group.map(function(c) {
                return {
                    symbol: c.symbol, name: c.name, country: c.country,
                    peRatio: c.peRatio, priceToBook: c.priceToBook,
                    roe: c.roe, dividendYield: c.dividendYield,
                    relativeValue: c.relativeValue
                };
            })
        };
    });

    allPairs.sort(function(a, b) { return b.compositeSpread - a.compositeSpread; });

    return {
        sectorAnalysis: sectorAnalysis,
        topOpportunities: allPairs.slice(0, 20),
        totalSectors: Object.keys(sectorAnalysis).length,
        totalPairsAnalyzed: allPairs.length
    };
}


// ========== MODULE EXPORTS ==========

module.exports = {
    // Section 1: Statistical Foundations
    mean,
    weightedMean,
    stdDev,
    sampleStdDev,
    covariance,
    correlation,
    percentile,
    skewness,
    kurtosis,
    downsideDeviation,
    rollingWindow,

    // Section 2: Matrix Operations
    matrixCreate,
    matrixMultiply,
    matrixTranspose,
    matrixInverse,
    matrixAdd,
    matrixScale,
    matrixDeterminant,
    choleskyDecomposition,
    covarianceMatrix,
    correlationMatrix,

    // Section 3: Distribution Functions
    normalPDF,
    normalCDF,
    normalInvCDF,
    tDistCDF,
    chiSquaredCDF,
    lnGamma,
    regIncBeta,

    // Section 4: OLS Regression
    olsRegression,
    heteroscedasticityTest,
    jarqueBeraTest,
    vif,

    // Section 5: Asset Pricing Models
    calculateBeta,
    capmExpectedReturn,
    famaFrench3,
    famaFrench5,
    carhart4,

    // Section 6: Risk Metrics
    parametricVaR,
    historicalVaR,
    monteCarloVaR,
    cvar,
    sortinoRatio,
    treynorRatio,
    informationRatio,
    calmarRatio,
    omegaRatio,
    trackingError,
    maxDrawdown,
    sharpeRatio,

    // Section 7: Portfolio Optimization
    solveMinVariance,
    efficientFrontier,
    minimumVariancePortfolio,
    tangencyPortfolio,
    riskParityPortfolio,

    // Section 8: Valuation Models
    dcf,
    gordonGrowthDDM,
    multiStageDDM,
    residualIncome,
    dcfSensitivity,

    // Section 9: Scoring Models
    altmanZScore,
    altmanZScoreEM,
    piotroskiFScore,
    beneishMScore,
    dupontAnalysis3,
    dupontAnalysis5,

    // Section 10: Cross-Sectional Regression
    crossSectionalRegression,

    // Section 11: Vision 2030 Diversification
    vision2030Score,

    // Section 12: Cross-GCC Relative Value
    gccRelativeValue
};
