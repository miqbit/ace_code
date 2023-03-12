import { useEffect, useReducer } from 'react';
import { Pxth } from 'pxth';

import { Stock } from './useStock';
import { useStockContext } from './useStockContext';
import { StockProxy } from '../typings';
import { useLazyRef } from '../utils/useLazyRef';

/**
 * Hook, which returns *actual* stock value.
 * This means, it will update component each time when value in stock changes.
 * @param path        - path to variable in stock, deeply gets value. @se