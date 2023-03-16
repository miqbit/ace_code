
import { act, renderHook } from '@testing-library/react-hooks';
import { createPxth, getPxthSegments } from 'pxth';

import { useObservers } from '../../src';

const renderUseObserversHook = () => renderHook(() => useObservers());

describe('Observer tests', () => {
	it('should call value observer', () => {
		const { result } = renderUseObserversHook();

		const observer = jest.fn();

		act(() => {
			result.current.watch(createPxth(['b']), observer);
			result.current.notifySubTree(createPxth(['b']), {
				b: 0,
			});
		});

		expect(observer).toBeCalled();
	});

	it('Should call all values observer', async () => {
		const { result } = renderUseObserversHook();

		const observer = jest.fn();
		let cleanup: () => void = () => {};

		act(() => {
			cleanup = result.current.watchAll(observer);
			result.current.notifySubTree(createPxth(['b']), { b: 0 });
		});

		expect(observer).toBeCalled();
		expect(result.current.isObserved(createPxth([]))).toBe(true);
		cleanup();
		expect(result.current.isObserved(createPxth([]))).toBe(false);
	});

	it('should call parent observer', () => {
		const { result } = renderUseObserversHook();

		const observer = jest.fn();

		act(() => {
			result.current.watch(createPxth(['parent']), observer);
			result.current.notifySubTree(createPxth(['parent', 'child']), {
				parent: {
					child: 0,
				},
			});
		});

		expect(observer).toBeCalled();
	});

	it('should call child observer', () => {
		const { result } = renderUseObserversHook();

		const observer = jest.fn();

		act(() => {
			result.current.watch(createPxth(['parent', 'child']), observer);
			result.current.notifySubTree(createPxth(['parent']), { parent: { child: 'b' } });
		});

		expect(observer).toBeCalled();
	});

	it('should call tree branch of observers', () => {
		const { result } = renderUseObserversHook();

		const observer = jest.fn();

		act(() => {
			result.current.watch(createPxth(['parent']), observer);
			result.current.watch(createPxth(['parent', 'child']), observer);
			result.current.watch(createPxth(['parent', 'child', 'value']), observer);
			result.current.notifySubTree(createPxth(['parent', 'child', 'value']), {
				parent: {
					child: {
						value: 'b',
					},
				},
			});
		});

		expect(observer).toBeCalledTimes(3);
	});

	it('should call all observers', () => {
		const { result } = renderUseObserversHook();

		const oberver = jest.fn();

		act(() => {
			result.current.watch(createPxth(['parent']), oberver);
			result.current.watch(createPxth(['parent', 'child']), oberver);
			result.current.watch(createPxth(['parent', 'child', 'value']), oberver);
			result.current.notifyAll({ parent: { child: { value: 'b' } } });
		});

		expect(oberver).toBeCalledTimes(3);
	});

	it("shouldn't call observer", () => {
		const { result } = renderUseObserversHook();

		const observer = jest.fn();

		act(() => {
			result.current.watch(createPxth(['parent', 'notInBranch']), observer);
			result.current.notifySubTree(createPxth(['parent', 'child', 'value']), {
				parent: {
					child: {
						value: 'newValue',