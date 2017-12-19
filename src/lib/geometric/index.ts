import { dgeom  } from './dgeom';
import { pgeom  } from './pgeom';
import { qgeom } from './qgeom';
import { rgeom as _rgeom } from './rgeom';
import { INormal, Normal } from '../normal';

export function Geometric(rng: INormal = Normal()){
    return {
      dgeom,
      pgeom,
      qgeom,
      rgeom:(N: number, prob: number) =>  _rgeom(N, prob, rng)
    };
}
