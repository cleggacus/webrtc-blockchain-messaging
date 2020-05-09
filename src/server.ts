import http from 'http';
import socketIO from 'socket.io';

const app = http.createServer();
const io = socketIO(app);
const port = process.env.PORT || 3001;

io.origins('*:*');

io.on('connection', (socket: socketIO.Socket) => {
    socket.on('socket', (init:boolean) => {
        socket.broadcast.emit('socket', {
            id: socket.id,
            init: init
        });
    });

    socket.on('sendOffer', (data:{ id:string, offer:any}) => {
        socket.to(data.id).emit('getOffer', data.offer);
    });

    socket.on('sendCandidate', (data:{id: string, candidate: any}) => {
        socket.to(data.id).emit('getCandidate', data.candidate);
    });
});

app.listen(port, () => {
    console.log(`running server on port: ${port}`);
});