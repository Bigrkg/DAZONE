var cluster = require('cluster'),
    webWorkers = [];
/*Use cluster when you want to parallelize the SAME flow of execution
and server listening.
Use child_process when you want DIFFERENT flows of execution
working together. */


if(cluster.isMaster) {
    var numWorkers = require('os').cpus().length;

    console.log('Master cluster setting up ' + numWorkers + ' workers...');

    for(var i = 0; i < numWorkers; i++) {
       
        addWebWorker();
    }

    cluster.on('online', function(worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });

    cluster.on('exit', function (worker, code, signal) {

        if (webWorkers.indexOf(worker.id) != -1) {
            //console.log('http worker ' + worker.process.pid + ' died. Trying to respawn...');
            removeWebWorker(worker.id);
            addWebWorker();
        }
    });
}
else {
    if (process.env.web) {
        //console.log('start http server: ' + cluster.worker.id);
        require("./app.js");//initialize the http server here
    }
}


    function addWebWorker() {
        webWorkers.push(cluster.fork({web: 1}).id);
    }

   
    function removeWebWorker(id) {
        webWorkers.splice(webWorkers.indexOf(id), 1);
    }