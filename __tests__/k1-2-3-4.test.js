/* Copyright (c) 2018 Looker Data Sciences, Inc. See https://github.com/looker-open-source/look-at-me-sideways/blob/master/LICENSE.txt */
const rule = require('../rules/k1-2-3-4');
const {parse} = require('lookml-parser');
require('../lib/expect-to-contain-message');


let K1 = {rule: 'K1'};
let K2 = {rule: 'K2'};
let K3 = {rule: 'K3'};
let K4 = {rule: 'K4'};
let error = {level: 'error'};

let summary = (m=1, ex=0, er=1) => ({
	level: 'info',
	description: `Evaluated ${m} matches, with ${ex} exempt and ${er} erroring`,
});


describe('Rules', () => {
	describe('K1', () => {
		it('should pass if a pk is defined starting with pk[0-9]_', () => {
			let result = rule(parse(`files:{} files:{
				view: foo {
					sql_table_name: foo ;;
					dimension: pk1_foo_id {}
				}
			}`));
			expect(result).toContainMessage({...K1, ...summary(1, 0, 0)});
			expect(result).not.toContainMessage({...K1, ...error});
		});
		it('should pass if a pk is defined starting with [0-9]pk_ (compatibility with v0 style guide)', () => {
			let result = rule(parse(`files:{} files:{
				view: foo {
					sql_table_name: foo ;;
					dimension: 1pk_foo_id {}
				}
			}`));
			expect(result).toContainMessage({...K1, ...summary(1, 0, 0)});
			expect(result).not.toContainMessage({...K1, ...error});
		});
		it('should pass if a pk is defined starting with pk_ (shorthand for pk1_)', () => {
			let result = rule(parse(`files:{} files:{
				view: foo {
					sql_table_name: foo ;;
					dimension: pk_foo_id {}
				}
			}`));
			expect(result).toContainMessage({...K1, ...summary(1, 0, 0)});
			expect(result).not.toContainMessage({...K1, ...error});
		});
		it('should pass if a pk is defined starting with pk[0-9]_, even if it would fail K2', () => {
			let result = rule(parse(`files:{} files:{
				view: foo {
					sql_table_name: foo ;;
					dimension: pk2_foo_id {}
				}
			}`));
			expect(result).toContainMessage({...K1, ...summary(1, 0, 0)});
			expect(result).not.toContainMessage({...K1, ...error});
		});
		it('should pass if multiple pks are defined starting with pk[0-9]_', () => {
			let result = rule(parse(`files:{} files:{
				view: foobar {
					sql_table_name: foobar ;;
					dimension: pk2_foo_id {}
					dimension: pk2_bar_id {}
				}
			}`));
			expect(result).toContainMessage({...K1, ...summary(1, 0, 0)});
			expect(result).not.toContainMessage({...K1, ...error});
		});
		it('should pass if multiple pks are defined starting with pk_, even if they would fail K2', () => {
			let result = rule(parse(`files:{} files:{
				view: foobar {
					sql_table_name: foobar ;;
					dimension: pk_foo_id {}
					dimension: pk_bar_id {}
				}
			}`));
			expect(result).toContainMessage({...K1, ...summary(1, 0, 0)});
			expect(result).not.toContainMessage({...K1, ...error});
		});

		it('should error if no pk is defined', () => {
			let result = rule(parse(`files:{} files:{
				view: foo {
					sql_table_name: foo ;;
					dimension: foo_id {}
				}
			}`));
			expect(result).toContainMessage({...K1, ...summary(1, 0, 1)});
			expect(result).toContainMessage({...K1, ...error});
		});

		it('should error if a pk is defined incorrectly using [0-9]pk[0-9]_.*', () => {
			let result = rule(parse(`files:{} files:{
				view: foo {
					sql_table_name: foo ;;
					dimension: 2pk2_baz {}
				}
			}`));
			expect(result).toContainMessage({...K1, ...summary(1, 0, 1)});
			expect(result).toContainMessage({...K1, ...error});
		});

		it('should not error if no pk is found and file is exempt from rule', () => {
			let result = rule(parse(`files:{} files:{
				view: foo {
					sql_table_name: foo ;;
					rule_exemptions: {K1: "Who cares about primary keys"}
					dimension: baz {}
					dimension: qux {}
				}
			}`));
			expect(result).toContainMessage({...K1, ...summary(1, 1, 0)});
			expect(result).not.toContainMessage({...K1, ...error});
		});


		it('should not error if no pk is found and project is exempt from the rule', () => {
			let result = rule(parse(`files:{} files:{
				view: foo {
					sql_table_name: foo ;;
					dimension: baz {}
					dimension: qux {}
				}
			}
			manifest: {rule_exemptions: {K1: "It's ok, exempt"}}`));
			expect(result).toContainMessage({...K1, ...summary(1, 1, 0)});
			expect(result).not.toContainMessage({...K1, ...error});
		});

		it('should error if no pk is found and project is exempt from another rule', () => {
			let result = rule(parse(`files:{} files:{
				view: foo {
					sql_table_name: foo ;;
					dimension: baz {}
					dimension: qux {}
				}
			}
			manifest: {rule_exemptions: {X1: "Different exemption"}}`));
			expect(result).toContainMessage({...K1, ...summary(1, 0, 1)});
			expect(result).toContainMessage({...K1, ...error});
		});

		it('should not error (nor match) if there is no sql_table_name', () => {
			let result = rule(parse(`files:{} files:{
				view: foo {
					dimension: bar {}
					dimension: baz {}
				}
			}`));
			expect(result).toContainMessage({...K1, ...summary(0, 0, 0)});
			expect(result).not.toContainMessage({...K1, ...error});
		});
	});

	describe('K2', () => {
		it('should pass if all pks are prefixed with the same {n}pk|pk{n} in a given view', () => {
			let result = rule(parse(`files:{} files:{
				view: foo {
					sql_table_name: bar ;;
					dimension: 1pk_baz {}
				}
			}`));
			expect(result).toContainMessage({...K2, ...summary(1, 0, 0)});
			expect(result).not.toContainMessage({...K2, ...error});
		});

		it('should pass if number of pks matches {n} in {n}pk', () => {
			let result = rule(parse(`files:{} files:{
				view: foo {
					sql_table_name: bar ;;
					dimension: 2pk_baz {}
					dimension: 2pk_qux {}
				}
			}`));
			expect(result).toContainMessage({...K2, ...summary(1, 0, 0)});
			expect(result).not.toContainMessage({...K2, ...error});
		});

		it('should pass even if pks are defined using different prefixes in a given view', () => {
			let result = rule(parse(`files:{} files:{
				view: foo {
					sql_table_name: bar ;;
					dimension: 2pk_baz {}
					dimension: pk2_qux {}
				}
			}`));
			expect(result).toContainMessage({...K2, ...summary(1, 0, 0)});
			expect(result).not.toContainMessage({...K2, ...error});
		});
		it('should error if the number of pks does not match {n} in pk{n}_', () => {
			let result = rule(parse(`files:{} files:{
				view: foo {
					sql_table_name: foo ;;
					dimension: pk2_foo_id {}
				}
			}`));
			expect(result).toContainMessage({...K2, ...summary(1, 0, 1)});
			expect(result).toContainMessage({...K2, ...error});
		});

		it('should error if the number of pks does not match {n} in {n}pk_ (style guide v0 compatibility naming convention)', () => {
			let result = rule(parse(`files:{} files:{
				view: foo {
					sql_table_name: bar ;;
					dimension: 3pk_baz {}
					dimension: 3pk_qux {}
				}
			}`));
			expect(result).toContainMessage({...K2, ...summary(1, 0, 1)});
			expect(result).toContainMessage({...K2, ...error});
		});

		it('should error if the number of pks is >1 in pk_ (shorthand for pk1_)', () => {
			let result = rule(parse(`files:{} files:{
				view: foobar {
					sql_table_name: foobar ;;
					dimension: pk_foo_id {}
					dimension: pk_bar_id {}
				}
			}`));
			expect(result).toContainMessage({...K2, ...summary(1, 0, 1)});
			expect(result).toContainMessage({...K2, ...error});
		});
	});

	describe('K3', () => {
		it('should pass if pks are defined first in view file', () => {
			let result = rule(parse(`files:{} files:{
				view: foo {
					sql_table_name: bar ;;
					dimension: 1pk_baz {}
				}
			}`));
			expect(result).toContainMessage({...K3, ...summary(1, 0, 0)});
			expect(result).not.toContainMessage({...K3, ...error});
		});

		it('should error if pks are not defined first in view file', () => {
			let result = rule(parse(`files:{} files:{
				view: foo {
					sql_table_name: bar ;;
					dimension: baz {}
					dimension: 1pk_qux {}
				}
			}`));
			expect(result).toContainMessage({...K3, ...summary(1, 0, 1)});
			expect(result).toContainMessage({...K3, ...error});
		});
	});

	describe('K4', () => {
		it('should pass if all pks are hidden', () => {
			let result = rule(parse(`files:{} files:{
				view: foo {
					sql_table_name: bar ;;
					dimension: 1pk_baz { hidden: yes }
				}
			}`));
			expect(result).toContainMessage({...K4, ...summary(1, 0, 0)});
			expect(result).not.toContainMessage({...K4, ...error});
		});

		it('should error if any pk is not hidden', () => {
			let result = rule(parse(`files:{} files:{
				view: foo {
					sql_table_name: bar ;;
					dimension: 2pk_baz { hidden: yes }
					dimension: 2pk_qux {}
				}
			}`));
			expect(result).toContainMessage({...K4, ...summary(1, 0, 1)});
			expect(result).toContainMessage({...K4, ...error});
		});
	});
});
