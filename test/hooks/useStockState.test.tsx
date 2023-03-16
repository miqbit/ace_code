import React from 'react';
import { act, renderHook } from '@testing-library/react-hooks';
import { createPxth, Pxth } from 'pxth';

import { Stock, StockContext, useStock, useStockState } from '../../src';

const initialValues = {
	hello: 'test',
	parent: {
		child: 'value',
	},
	value: 0,
	array: [
		1,
		{
			value: 'second',
		},
	],
};

let stock: Stock<typeof initialValues>;

const wrapper: React.FC = ({ children }) => (
	<StockContext.Provider value={stock as unknown as Stock<object>}>{children}</StockContext.Provider>
);

const renderUseStockState = (path: Pxth<unknown>, useContext = true) =>
	renderHook(() => useStockState(path, useContext ? undefined : stock), {
		wrapper: useContext ? wrapper : undefined,
	});

beforeEach(() => {
	const { result } = renderHook(() => useStock({ initialValues }), { wrapper });
	stock = result.current;
});

const testWrapper = (testName: string, useContext: boolean) => {
	describe(testName, () => {
		it('Should set value via setter', async () => {
			const { result, waitForNextUpdate } = renderUseStockState(createPxth(['parent', 'child']), useContext);

			const newValue = 'newValue';

			await act(async () => {
				const [, setValue] = result.current;
				setValue(newValue);
				await waitForNextUpdate({ timeou