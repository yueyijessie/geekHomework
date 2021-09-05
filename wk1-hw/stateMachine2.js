// 使用状态机处理字符串 abcabx
function match(string){
    let state = start;
    for (let c of string){
        state = state(c);
    }
    return state === end;
}

function start(c){
    if (c === 'a'){
        return founda;
    } else {
        return start;
    }
}

function end(c){
    return end;
}

function founda(c){
    if (c === 'b'){
        return foundb;
    } else {
        return start;
    }
}

function foundb(c){
    if (c === 'c'){
        return foundc;
    } else {
        return start;
    }
}

function foundc(c){
    if (c === 'a'){
        return founda2;
    } else {
        return start;
    }
}

function founda2(c){
    if (c === 'b'){
        return foundb2;
    } else {
        return foundb;
    }
}

function foundb2(c){
    if (c === 'x'){
        return end;
    } else {
        return start;
    }
}

console.log(match("I mabcabcghiij"));

