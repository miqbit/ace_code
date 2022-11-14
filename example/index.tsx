import React from 'react';
import { BrowserRouter, Link, Route } from 'react-router-dom';
import ReactDOM from 'react-dom';

import 'react-app-polyfill/ie11';

import { ProxyExample } from './components/ProxyExample';
import { StockExample } from './components/StockExample';

const App = () => {
	return (
		<BrowserRouter>
			<menu>
				<li>
					<Link to="/StockExample">Stock example</Link>
				</li>
				<li>
					<Link to="/ProxyEx