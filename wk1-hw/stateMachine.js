// find "a" in a string
function finda(str) {
    if (str.indexOf("a") !== -1) {
        return true;
    }
    return false;
}

// find "ab" in a string
function findab(str) {
    for (let i = 0; i < str.length; i++) {
        if (str[i] === 'a'){
            founda = true;
        } else if (str[i] === 'b' && founda){
            return true;
        }
    }
    return false;
}

// find "abcdef" in a string
function findabcdef(str) {
    let founda = false;
    let foundb = false;
    let foundc = false;
    let foundd = false;
    let founde = false;
    for (let c of str){
        if (c == 'a'){
            founda = true;
        } else if (c == 'b' && founda){
            foundb = true;
        } else if (c == 'c' && foundb){
            foundc = true;
        } else if (c == 'd' && foundc){
            foundd = true;
        } else if (c == 'e' && foundd){
            founde = true;
        } else if (c == 'f' && founde){
            return true;
        }
    }
    return false;
}

// 使用状态机处理字符串 abcdef
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
    if (c === 'd'){
        return foundd;
    } else {
        return start;
    }
}

function foundd(c){
    if (c === 'e'){
        return founde;
    } else {
        return start(c);
    }
}

function founde(c){
    if (c === 'f'){
        console.log('found');
        return end;
    } else {
        return start(c);
    }
}

console.log(match("I mabcdefghiij"));