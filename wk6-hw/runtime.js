export class ExecutionContext {
    constructor(realm, lexicalEnvironment, variableEnvironment){
        variableEnvironment = variableEnvironment || lexicalEnvironment;
        this.lexicalEnvironment = lexicalEnvironment;
        this.variableEnvironment = variableEnvironment;
        this.realm = realm;
    }
    // lexicalEnvironment:{a:1, b:2}
}

export class Reference {
    constructor(object, property){
        this.object = object;
        this.property = property;
    }
    set(value){
        this.object[this.property] = value;
    }
    get(){
        return this.object[this.property];
    }
}


export class Realm {
    constructor(){
        this.global = new Map(),
        this.Object = new Map(),
        this.Object.call = function(){

        }
        this.Object_prototype = new Map()
    }
}

// 暂时不用
export class EnvironmentRecord {
    constructor(){
        this.thisValue
        this.variables = new Map(),
        this.outer = null;
    }
}
