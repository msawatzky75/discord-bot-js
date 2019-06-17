import 'mocha';
import {expect} from 'chai';
import {Reminder} from '../src/commands/remind';
// import moment from 'moment';

describe("Remind command", () => {
	describe("parse quantity", () => {
		it('should parse numbers without decimals', () => {
			expect(Reminder.parseQuantity("1")).to.equal(1);
		});

		it('should parse numbers with decimals', () => {
			expect(Reminder.parseQuantity("1.21345")).to.equal(1.21345);
		});

		it('should parse valid words', () => {
			expect(Reminder.parseQuantity("one")).to.equal(1);
			expect(Reminder.parseQuantity("twenty")).to.equal(20);
		});

		it('should return undefined on an invalid string', () => {
			expect(Reminder.parseQuantity("tnhueoa")).to.equal(undefined);
		});
	});
});
