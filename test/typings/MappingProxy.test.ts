import { createPxth, deepGet, deepSet, getPxthSegments, Pxth, samePxth } from 'pxth';

import { MappingProxy, Observer, ProxyMapSource } from '../../src/typings';

type RegisteredUser = {
	registrationDate: Date;
	personalData: {
		name: {
			firstName: string;
			lastName: string;
		};
		birthday: Date;
	};
};

const getUserMapSource = (): ProxyMapSource<RegisteredUser> => {
	return {
		registrationDate: createPxth<Date>(['registeredUser', 'dates', 'registration']),
		personalData: {
			name: {
				firstName: createPxth(['registeredUser', 'name']),
				lastName: createPxth(['registeredUser', 'surname']),
			},
			birthday: createPxth<Date>(['dateOfBirth']),
		},
	};
};

describe('Mapping proxy', () => {
	it('should instantiate', () => {
		expect(() => new MappingProxy({}, createPxth(['']))).not.toThrowError();
	});

	it('observe/stopObserving value', () => {
		const proxy = new MappingProxy(
			{ hello: createPxth(['a', 'b', 'c']), bye: createPxth(['a', 'b', 'd']) },
			createPxth(['asdf']),
		);

		const defaultObserve = jest.fn();
		const observer = jest.fn();

		defaultObserve.mockReturnValue(0);

		proxy.watch(createPxth(['asdf', 'hello']), observer, defaultObserve);

		expect(getPxthSegments(defaultObserve.mock.calls[0][0])).toStrictEqual(['a', 'b', 'c']);

		defaultObserve.mockClear();

		proxy.watch(createPxth(['asdf', 'bye']), observer, defaultObserve);
		expect(getPxthSegments(defaultObserve.mock.calls[0][0])).toStrictEqual(['a', 'b', 'd']);
	});

	it('observe/stopObserving (empty mapping path)', () => {
		const proxy = new MappingProxy(createPxth(['a', 'd', 'c']), createPxth(['asdf']));

		const defaultObserve = jest.fn();
		const observer = jest.fn();

		defaultObserve.mockReturnValue(0);

		proxy.watch(createPxth(['asdf']), observer, defaultObserve);
		expect(getPxthSegments(defaultObserve.mock.calls[0][0])).toStrictEqual(['a', 'd', 'c']);

		defaultObserve.mockClear();
	});

	it('observe/stopObserving value (empty parent path)', () => {
		const proxy = new MappingProxy(
			{ hello: createPxth(['a', 'd', 'c']), bye: createPxth(['b', 'b', 'd']) },
			createPxth([]),
		);

		const defaultObserve = jest.fn();
		const o