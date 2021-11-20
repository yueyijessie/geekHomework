var Generator = require('yeoman-generator');

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);
    }
    async method1() {
        // 通过命令行与用户交互，prompt输入
        const answers = await this.prompt([
            {
                type: "input",
                name: "name",
                message: "Your project name",
                default: this.appname
            },
            {
                type: "confirm",
                name: "cool",
                message: "Would you like to enable the Cool feature?"
            }
        ])
        this.log('app name', answers.name);
        this.log('cool feature', answers.cool);
    }
}
