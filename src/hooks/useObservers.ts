import { useCallback, useRef } from 'react';
import { createPxth, deepGet, isInnerPxth, Pxth, samePxth } from 'pxth';
import invariant from 'tiny-invariant';

import { BatchUpdate, Observer } from '../typings';
import { PxthMap } from '../typi