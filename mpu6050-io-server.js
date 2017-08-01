/**
 * 30-Jul-2017  John Politis
* Description: MPU6050-io-Server: This is used to serve the mpu6050's accelerometer and gyro
 *              data over a socket-io connection
 */
var sensor = require('./mpu6050-i2c-bus');
var http = require('http');
/**
 * Establish a queue for accelerometer data
 */
var accelerometer_queue = [];
/**
 * Establish a queue for gryo data.
 */
var gyro_queue = [];
/**
 * 31-Jul-2017  John Politis
 * Description: 
 *      Start up our sensor. The mpu6050 will be sampling the data for us to receive it, Sample rate is every 100ms
 *      The call back routine is used to dump the data to the console
 */
sensor.mpu6050.run( 300 , function() {
    
    for (var i = 0; i < accelerometer_queue.length ; i++ ) {
        accelerometer_queue[i].emit('accelerometer' , sensor.mpu6050.acceleromter);
    }
    
    for (var i = 0; i < gyro_queue.length ; i++ ) {
        gyro_queue[i].emit('gyro' , sensor.mpu6050.gyro);
    }
           
});
/**
 * 31-Jul-2017  John Politis
 * Description: Setup a simple http server on port 8888
 */
server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
//   res.write('{ "accelerometer" : "Connection to Server Established..."}');
  res.end();
  
}).listen(8888);
/**
 * 31-Jul-2017  John Politis
 * Description: 
 */
var io = require('socket.io').listen(server);
/**
 * 31-Jul-2017  John Politis
 * Description: This routine will be called when there is a connection comming from the socket.io subsystem*      
 */
io.on('connection', function (socket) {
    socket.on('accelerometer', accelerometer_subscription);
    socket.on('gyro', gyro_subscription);

});
/**
 * 31-Jul-2017  John Politis
 * Description: save the connection on the internal queue
 */
function accelerometer_subscription(data) {
    accelerometer_queue.push(this);   
}
/**
 * 31-Jul-2017  John Politis
 * Description: save the connection on the internal queue     
 */
function gyro_subscription(data) {
    gyro_queue.push(this);   
}
/**
 * 31-Jul-2017  John Politis
 * Description:     
 */
server.listen(console.log("Server Running Port:8888..."));

 
