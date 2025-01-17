const lams = require('../../../../index.js')
const mocks = require('../../../../lib/mocks.js')
const path= require('path')
const options = {reporting:"no", cwd:__dirname}
require('../../../../lib/expect-to-contain-message');
const log = x=>console.log(x)
const testProjectName = __dirname.split(path.sep).slice(-2).join(" > ");
const packageJson = require('../../../../package.json')

describe('Projects', () => {
	describe(testProjectName, () => {
		let {spies, process, console} = mocks()
		let messages
		beforeAll( async () => {
			messages = await lams(options,{process, console})
		})
		it("should not error out", ()=> {
			expect(console.error).not.toHaveBeenCalled()
		});
		it("it should not contain any unexpected parser (P0) errors", ()=> {
			expect({messages}).not.toContainMessage({
				rule: "P0",
				level: "error"
			});
		});

		it("it should not contain any parser syntax (P1) errors", ()=> {
			expect({messages}).not.toContainMessage({
				rule: "P1",
				level: "error"
			});
		});

		const majorVersion = parseInt(packageJson.version.split(".")[0]);
		if(majorVersion <= 2){
			it("v2: it should not error on rule F4 for dimension_groups without labels", ()=> {
				expect({messages}).not.toContainMessage({
					rule: "F4",
					level: "error",
				});
			});
		}
		else{
			it("v3+: it should error on rule F4 for dimension_groups without labels", ()=> {
				expect({messages}).toContainMessage({
					rule: "F4",
					level: "error",
				});
			});
		}
	});
});
