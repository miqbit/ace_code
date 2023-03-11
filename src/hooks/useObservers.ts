import { useCallback, useRef } from 'react';
import { createPxth, deepGet, isInnerPxth, Pxth, samePxth } from 'pxth';
import invariant from 'tiny-invariant';

import { BatchUpdate, Observer } from '../typings';
import { PxthMap } from '../typings/PxthMap';
import { ObserverArray, ObserverKey } from '../utils/ObserverArray';
import { useLazyRef } from '../utils/useLazyRef';

export type ObserversControl<T> = {
	/** Watch stock value. Returns cleanup function. */
	watch: <V>(path: Pxth<V>, observer: Observer<V>) => () => void;
	/** Watch all stock values. Returns cleanup function. */
	watchAll: (observer: Observer<T>) => () => void;
	/** Check if value is observed or not. */
	isObserved: <V>(path: Pxth<V>) => boolean;
	/** Notify all observers, which are children of specified path */
	notifySubTree: <V>(path: Pxth<V>, values: T) => void;
	/** Notify all observers */
	notifyAll: (values: T) => void;
	/** "stocked" updates values in batches, so you can subscribe to batch updates. Returns cleanup. */
	watchBatchUpdates: (observer: Observer<BatchUpdate<T>>) => () => void;
};

/** Hook, wraps functionality of observers storage (add, remove, notify tree of observers, etc.) */
export const useObservers = <T>(): ObserversControl<T> => {
	const observersMap = useRef<PxthMap<ObserverArray<unknown>>>(new PxthMap());
	const batchUpdateObservers = useLazyRef<ObserverArray<BatchUpdate<T>>>(() => new ObserverArray());

	const batchUpdate = useCallback(
		(update: BatchUpdate<T>) => {
			batchUpdateObservers.current.call(update);
		},
		[batchUpdateObservers],
	);

	const observeBatchUpdates = useCallback(
		(observer: Observer<BatchUpdate<T>>) => batchUpdateObservers.current.add(observer),
		[batchUpdateObservers],
	);

	const stopObservingBatchUpdates = useCallback(
		(key: ObserverKey) => batchUpdateObservers.current.remove(key),
		[batchUpdateObservers],
	);

	const observe = useCallback(<V>(path: Pxth<V>, observer: Observer<V>) => {
		if (!observersMap.current.has(path)) {
			observersMap.current.set(path, new ObserverArray());
		}

		return observersMap.current.get(path).add(observer as Observer<unknown>);
	}, []);

	const stop