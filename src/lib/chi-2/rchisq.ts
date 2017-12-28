/*  AUTHOR
 *  Jacob Bogers, jkfbogers@gmail.com
 *  March 20, 2017
 * 
 *  ORGINAL AUTHOR
 *  Mathlib : A C Library of Special Functions
 *  Copyright (C) 1998 Ross Ihaka
 *  Copyright (C) 2000 The R Core Team
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
 *  https://www.R-project.org/Licenses/
 *
 *  SYNOPSIS
 *
 *    #include <Rmath.h>
 *    double rchisq(double df);
 *
 *  DESCRIPTION
 *
 *    Random variates from the chi-squared distribution.
 *
 *  NOTES
 *
 *    Calls rgamma to do the real work.
 */

import * as debug from 'debug';
import { ML_ERR_return_NAN } from '~common';

import { INormal } from '~normal';
import { rgamma } from '../gamma/rgamma';

const { isFinite: R_FINITE } = Number;
const printer = debug('rchisq');

export function rchisq(
  n: number,
  df: number,
  normal: INormal
): number | number[] {
  const result = new Array(n).fill(0).map(() => {
    if (!R_FINITE(df) || df < 0.0) {
      return ML_ERR_return_NAN(printer);
    }
    return rgamma(1, df / 2.0, 2.0, normal) as number;
  });
  return result.length === 1 ? result[0] : result;
}
