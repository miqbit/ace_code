
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { createPxth } from 'pxth';

import { Stock, StockRoot, useStockContext } from '../../src';

let container: HTMLDivElement | null = null;

beforeEach(() => {
	container = document.createElement('div');
	document.body.appendChild(container);
});

afterEach(() => {
	if (container) {
		unmountComponentAtNode(container);
		container.remove();
		container = null;
	}
});

const StockExtractor = ({
	children,
	logStock,
}: {
	children?: React.ReactNode;
	logStock: (stock: Stock<any>) => void;
}) => {
	const stock = useStockContext();

	logStock(stock);

	return <div>{children}</div>;
};

describe('StockRoot context testing', () => {