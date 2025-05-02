import { SocketHandler } from "@/types/sockets";



export function useSendSocketMessage(): SocketHandler {
    const createElementMessage: SocketHandler['createElementMessage'] = ({ id, payload }) => {
        return {
            type: 'CREATE',
            id: id,
            payload
        }
    };
    return {
        createElementMessage,
    };
}
