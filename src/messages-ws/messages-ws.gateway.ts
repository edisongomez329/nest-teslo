import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';



@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {


  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) {

  }

  async handleConnection(client: Socket, ...args: any[]) {
    // subscribir un cliente a cierta sala de chat
    // client.join('sala-chat-ventas');
    // this.wss.to('sala-chat-ventas').emit('message-to-ventas', {message: 'en sala de ventas'});
    const clientToken = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    console.log(clientToken);
    
    try {
      payload = this.jwtService.verify(clientToken);
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect()
      return;
    }

    //console.log({payload});



    console.log({ "qty clients": this.messagesWsService.getConnectedClients() });
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }

  handleDisconnect(client: Socket) {
    //console.log("desConectado", client.id);
    this.messagesWsService.removeClient(client.id);

    console.log({ "qty clients": this.messagesWsService.getConnectedClients() });
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }

  @SubscribeMessage('message-from-client')
  onMessageFromClient(client: Socket, payload: NewMessageDto) {
    console.log({clientId: client.id, payload});

    //Emite unicamente al cliente que envia el mensaje
    // client.emit('message-from-server', {
    //   fullName: 'Soy Yo!',
    //   message: payload.message || 'No message'
    // });

    //Emite a todos los clientes, menos al que originalmente nos envia el mensaje
    // client.broadcast.emit('message-from-server', {
    //   fullName: this.messagesWsService.getFullName(client.id),
    //   message: payload.message || 'No message'
    // });


    //Emite a todos los clientes, incluyendo al que originalmente nos envia el mensaje
    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getFullName(client.id),
      message: payload.message || 'No message'
    });

  }
}
