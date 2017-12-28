/*
 *  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  feb 25, 2017
 * 
 *  ORIGINAL AUTHOR:
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000-2014 The R Core Team
 *  Copyright (C) 2003	    The R Foundation
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, a copy is available at
 * 
 *  License for JS language implementation
 *  https://www.jacob-bogers/libRmath.js/Licenses/
 * 
 *  License for R statistical package
 *  https://www.r-project.org/Licenses/
 *
 *  SYNOPSIS
 *
 *	double dnorm4(double x, double mu, double sigma, int give_log)
 *	      {dnorm (..) is synonymous and preferred inside R}
 *
 *  DESCRIPTION
 *
 *	Compute the density of the normal distribution.
 */
import * as debug from 'debug';
import {
  DBL_MANT_DIG,
  DBL_MIN_EXP,
  ldexp,
  M_1_SQRT_2PI,
  M_LN2,
  M_LN_SQRT_2PI,
  ML_ERR_return_NAN,
  R_D__0
} from '~common';

const {
  isNaN: ISNAN,
  isFinite: R_FINITE,
  MAX_VALUE: DBL_MAX,
  POSITIVE_INFINITY: ML_POSINF,
  NaN: ML_NAN
} = Number;
const { sqrt, exp, abs: fabs, round: R_forceint, log } = Math;
const printer = debug('dnorm4');
const { isArray } = Array;

export function dnorm4<T>(
  x: T,
  mu: number = 0,
  sigma: number = 1,
  give_log: boolean = false
): T {
  let fa: number[] = (() => (isArray(x) && x) || [x])() as any;

  let result = fa.map(fx => {
    if (ISNAN(fx) || ISNAN(mu) || ISNAN(sigma)) {
      return fx + mu + sigma;
    }

    if (!R_FINITE(sigma)) {
      return R_D__0(give_log);
    }

    if (!R_FINITE(fx) && mu === fx) {
      return ML_NAN; /* x-mu is NaN */
    }

    if (sigma <= 0) {
      if (sigma < 0) {
        return ML_ERR_return_NAN(printer);
      }
      /* sigma == 0 */
      return fx === mu ? ML_POSINF : R_D__0(give_log);
    }
    fx = (fx - mu) / sigma;

    if (!R_FINITE(fx)) return R_D__0(give_log);

    fx = fabs(fx);
    if (fx >= 2 * sqrt(DBL_MAX)) return R_D__0(give_log);
    if (give_log) {
      return -(M_LN_SQRT_2PI + 0.5 * fx * fx + log(sigma));
    }

    if (fx < 5) return M_1_SQRT_2PI * exp(-0.5 * fx * fx) / sigma;

    /* ELSE:

     * x*x  may lose upto about two digits accuracy for "large" x
     * Morten Welinder's proposal for PR#15620
     * https://bugs.r-project.org/bugzilla/show_bug.cgi?id=15620

     * -- 1 --  No hoop jumping when we underflow to zero anyway:

     *  -x^2/2 <         log(2)*.Machine$double.min.exp  <==>
     *     x   > sqrt(-2*log(2)*.Machine$double.min.exp) =IEEE= 37.64031
     * but "thanks" to denormalized numbers, underflow happens a bit later,
     *  effective.D.MIN.EXP <- with(.Machine, double.min.exp + double.ulp.digits)
     * for IEEE, DBL_MIN_EXP is -1022 but "effective" is -1074
     * ==> boundary = sqrt(-2*log(2)*(.Machine$double.min.exp + .Machine$double.ulp.digits))
     *              =IEEE=  38.58601
     * [on one x86_64 platform, effective boundary a bit lower: 38.56804]
     */
    if (fx > sqrt(-2 * M_LN2 * (DBL_MIN_EXP + 1 - DBL_MANT_DIG))) {
      return 0;
    }

    /* Now, to get full accurary, split x into two parts,
   /* Now, to get full accurary, split x into two parts,
     *  x = x1+x2, such that |x2| <= 2^-16.
     * Assuming that we are using IEEE doubles, that means that
     * x1*x1 is error free for x<1024 (but we have x < 38.6 anyway).

     * If we do not have IEEE this is still an improvement over the naive formula.
     */
    let x1 = ldexp(R_forceint(ldexp(fx, 16)), -16); //  R_forceint(x * 65536) / 65536 =
    let x2 = fx - x1;
    return (
      M_1_SQRT_2PI / sigma * (exp(-0.5 * x1 * x1) * exp((-0.5 * x2 - x1) * x2))
    );
  });

  return (result.length === 1 ? result[0] : result) as any;
}
