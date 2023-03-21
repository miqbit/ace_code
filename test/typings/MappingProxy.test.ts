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
		const observer = jest.fn();

		defaultObserve.mockReturnValue(0);

		proxy.watch(createPxth(['hello']), observer, defaultObserve);
		expect(getPxthSegments(defaultObserve.mock.calls[0][0])).toStrictEqual(['a', 'd', 'c']);

		defaultObserve.mockClear();

		proxy.watch(createPxth(['bye']), observer, defaultObserve);
		expect(getPxthSegments(defaultObserve.mock.calls[0][0])).toStrictEqual(['b', 'b', 'd']);
	});

	it('calling observer fns', () => {
		const fullUser = {
			personalData: {
				name: {
					firstName: 'Hello',
					lastName: 'World',
				},
				birthday: new Date('2020.12.26'),
			},
			registrationDate: new Date('2020.12.31'),
			notify: true,
		};
		const rawData = {
			registeredUser: {
				name: fullUser.personalData.name.firstName,
				surname: fullUser.personalData.name.lastName,
				dates: {
					registration: fullUser.registrationDate,
				},
			},
			dateOfBirth: fullUser.personalData.birthday,
		};

		const proxy = new MappingProxy<RegisteredUser>(getUserMapSource(), createPxth(['registeredUser']));

		const observers: Observer<unknown>[] = [];

		const defaultObserve = jest.fn((_, observer) => {
			observers.push(observer);
			return () => observers.splice(observers.indexOf(observer), 1);
		});
		const observer = jest.fn();

		proxy.watch(createPxth(['registeredUser', 'personalData', 'name', 'firstName']), observer, defaultObserve);

		expect(getPxthSegments(defaultObserve.mock.calls[0][0])).toStrictEqual(['registeredUser', 'name']);

		defaultObserve.mockClear();

		proxy.watch(createPxth(['registeredUser', 'personalData', 'name']), observer, defaultObserve);
		expect(getPxthSegments(defaultObserve.mock.calls[0][0])).toStrictEqual(['registeredUser']);

		defaultObserve.mockClear();

		proxy.watch(createPxth(['registeredUser', 'personalData']), observer, defaultObserve);
		expect(getPxthSegments(defaultObserve.mock.calls[0][0])).toStrictEqual([]);

		observers[0](rawData.registeredUser.name);

		expect(observer).toBeCalledWith(fullUser.personalData.name.firstName);

		observer.mockClear();

		observers[1](rawData.registeredUser);
		expect(observer).toBeCalledWith(fullUser.personalData.name);

		observer.mockClear();

		observers[2](rawData);
		expect(observer).toBeCalledWith(fullUser.personalData);
	});

	it('calling observer fns (complex cases)', () => {
		const fullData = {
			truck: {
				driver: {
					name: 'Hello',
					surname: 'Bye',
					phone: '+333533333',
				},
				info: {
					trailerNo: 'AAA111',
					truckNo: 'AAA222',
				},
				owner: {
					companyId: 0,
					companyName: 'Hello World',
					contacts: [
						{
							contactId: 0,
							name: 'Bill Bill',
							contactInfo: {
								email: 'bill.bill@mail.loc',
								phone: '+333 333 333',
							},
						},
					],
				},
			},
		};
		const rawData = {
			truck: {
				plate_no: fullData.truck.info.truckNo,
			},
			trailer: {
				plate_no: fullData.truck.info.trailerNo,
			},
			company: fullData.truck.owner.companyName,
			contact_name: fullData.truck.owner.contacts[0].name,
			contact_id: fullData.truck.owner.contacts[0].contactId,
			contact_email: fullData.truck.owner.contacts[0].contactInfo.email,
			contact_phone: fullData.truck.owner.contacts[0].contactInfo.phone,
		};

		const proxy = new MappingProxy<{
			info: {
				truckNo: string;
				trailerNo: string;
			};
			owner: {
				name: string;
				contactId: number;
				contactInfo: {
					email: string;
					phone: string;
				};
			};
		}>(
			{
				info: {
					truckNo: createPxth(['truck', 'plate_no']),
					trailerNo: createPxth(['trailer', 'plate_no']),
				},
				owner: {
					name: createPxth(['contact_name']),
					contactId: createPxth(['contact_id']),
					contactInfo: {
						email: createPxth(['contact_email']),
						phone: createPxth(['con