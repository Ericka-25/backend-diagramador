const { Socket } = require("socket.io");

class Sockets {

    constructor( io ) {

        this.io = io;     
        this.rooms = {}; // Añadimos un objeto para gestionar las salas y los usuarios conectados   
        this.socketEvents();
    }

    socketEvents(){
        this.io.on('connection',(socket)=>{
            console.log('Cliente conectado', socket.id);

            // Alguien se une a la sala
            socket.on('joinRoom', (data) => {
                const { room, name } = data;

                if (!this.rooms[room]) {
                    this.rooms[room] = [];
                }
                 // Busca si ya existe una conexión con el mismo ID de socket (para evitar duplicados)
                 const existingUser = this.rooms[room].find(user => user.name === name);

                
                 if (existingUser) {
                    // Si el usuario ya existe, actualiza su socket ID y lo marca como conectado
                    existingUser.id = socket.id;
                    existingUser.connected = true;
                } else {
                    // Si no existe, lo agrega a la sala
                    this.rooms[room].push({ id: socket.id, name, connected: true });
                }

                socket.join(room);

                // Emitir la lista de usuarios en la sala
                this.io.to(room).emit('usersInRoom', this.rooms[room]);
            });

           // Alguien se desconecta
           socket.on('disconnect', () => {
                console.log('Cliente desconectado', socket.id);

             // Actualizar el estado de "conectado" del usuario en todas las salas
                for (const room in this.rooms) {
                     const userIndex = this.rooms[room].findIndex(user => user.id === socket.id);
                    if (userIndex !== -1) {
                     this.rooms[room][userIndex].connected = false;
                        this.io.to(room).emit('usersInRoom', this.rooms[room]);
                    }
                 }
            });
            

            

            // Alguien deja la sala
            socket.on('leaveRoom', (data) => {
                const { room } = data;
                console.log(`Cliente dejó la sala: ${room}`);
                socket.leave(room);

                if (this.rooms[room]) {
                    const userIndex = this.rooms[room].findIndex(user => user.id === socket.id);

                    // Cambiar su estado a desconectado en lugar de eliminarlo
                    if (userIndex !== -1) {
                        this.rooms[room][userIndex].connected = false;
                    }

                    // Emitir la lista actualizada de usuarios
                    this.io.to(room).emit('usersInRoom', this.rooms[room]);
                }
            });

            socket.on('insertNode', (data) => {
                console.log(`backend: nuevo nodo insertado`, JSON.stringify(data.node));
                this.io.to(data.room).emit('newNode', data);
            });

            socket.on('moveNode', (data) => {
                console.log(`un usuario ha movido un nodo ${data.node?.data?.title || 'sin título'}`);
                this.io.to(data.room).emit('movedNode', data);
            });

            socket.on('deleteNodes', (data) => {
                console.log(`delete nodes ${data}`);
                this.io.to(data.room).emit('deletedNodes', data.nodes);
            })

            socket.on('updateNode', (data) => {
                console.log(`update node ${data}`);
                this.io.to(data.room).emit('updatedNode', data);
            })

            socket.on(`insertEdge`, (data) => {
                console.log(`backend: nuevo edge insertado ${data.edge}`);
                this.io.to(data.room).emit('newEdge', data);
            });

            socket.on('deleteEdges', (data) => {
                console.log(`delete edges ${data}`);
                this.io.to(data.room).emit('deletedEdges', data.edges);
            });

            socket.on('setLabel', (data) => {
                console.log(`set label edge ${data.edges}`);
                this.io.to(data.room).emit('changeLabel', data);
            });
        });
    }
}
module.exports = Sockets