
const http = require('http'); // Node.js 內建模組
const {v4: uuidv4} = require('uuid'); // 外部 NPM
const errorHandle = require('./errorHandle'); // 自訂 Module
const todos = [];

const requestListener = (req, res)=>{
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
        'Content-Type': 'application/json'
    }
    let body = "";
    req.on('data', chunk=>{ // 將傳送的 TCP 封包組合起來 
        body += chunk; 
    })
    
    if (req.url == "/todos" && req.method == "GET") {
        res.writeHead(200, headers);
        res.write(JSON.stringify({ //把物件解析成字串傳遞(否則網路封包無法解析)
            "status": "success",
            "data": todos,
        }));
        res.end();
    }else if(req.url == "/todos" && req.method == "POST"){
        req.on('end', ()=>{ // 確保 body 有資料 (等待 req.body 接收完成，透過 on(''end) 觸發)
            try {
                const title = JSON.parse(body).title; // 需將 body(string) 轉成物件格式 ，才可讀取
                if (title !== undefined) {
                    const todo = { 
                        "title": title,
                        "id": uuidv4()
                    }
                    todos.push(todo);
                    
                    res.writeHead(200, headers);
                    res.write(JSON.stringify({
                        "status": "success",
                        "data": todos,
                    }));
                    res.end();
                }else{
                    errorHandle(res);
                }
                
            } catch (error) {
                errorHandle(res);
            }
            
        })
        
    }else if(req.url == "/todos" && req.method == "DELETE"){
        todos.length = 0; // 將陣列內容全部清掉
        res.writeHead(200, headers);
        res.write(JSON.stringify({ //把物件解析成字串傳遞(否則網路封包無法解析)
            "status": "success",
            "data": todos,
        }));
        res.end();
    }else if(req.url.startsWith("/todos/") && req.method == "DELETE"){
        const id = req.url.split('/').pop();
        const index = todos.findIndex(element=> element.id == id);
        if (index !== -1) {
            todos.splice(index, 1);
            console.log(id, index);
            res.writeHead(200, headers);
            res.write(JSON.stringify({ 
                "status": "success",
                "data": todos,
                
            }));
            res.end();
        }else{
            errorHandle(res);
        }
        
    }else if(req.url.startsWith("/todos/") && req.method == "PATCH"){
        req.on('end', ()=>{
            try {
                const todo = JSON.parse(body).title;
                const id = req.url.split('/').pop();
                const index = todos.findIndex(element=> element.id == id);
                if (todo !== undefined && index !== -1) {
                    todos[index].title = todo;
                    res.writeHead(200, headers);
                    res.write(JSON.stringify({ 
                        "status": "success",
                        "data": todos,
                    }));
                    res.end();
                }else{
                    errorHandle(res);
                }
                
            } catch {
                errorHandle(res);
            }
        })
    }else if(request.method == "OPTIONS"){
        res.writeHead(200, headers);
        res.end();
    }else {
        res.writeHead(404, headers);
        res.write(JSON.stringify({
            "status": "false",
            "message": "無此網站路由",
        }));
        res.end();
    }
    
}

const server = http.createServer(requestListener);
server.listen(3005);