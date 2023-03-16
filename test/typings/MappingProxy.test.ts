import { createPxth, deepGet, deepSet, getPxthSegments, Pxth, samePxth } from 'pxth';

import { MappingProxy, Observer, ProxyMapSource } from '../../src/typings';

type RegisteredUser = {
	registrationDate: Date;
	personalData: {
		name: {
			firstName: string;
			lastName: string;
		};
		b