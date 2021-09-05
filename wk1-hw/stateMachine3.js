// 使用状态机处理字符串 abababx

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
    if (c === 'a'){
        return founda3;
    } else {
        return start;
    }
}

function founda3(c){
    if (c === 'b'){
        return foundb3;
    } else {
        return foundb2;
    }
}

function foundb3(c){
    if (c === 'x'){
        return end;
    } else {
        return start;
    }
}

console.log(match("I mababababxghiij"));