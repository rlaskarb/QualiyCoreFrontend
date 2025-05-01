import { useState, useEffect } from "react";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const useWebSocket = (url, topic) => {
    const [messages, setMessages] = useState([]); // 수신된 메시지 저장
    const [stompClient, setStompClient] = useState(null); // WebSocket 클라이언트

    useEffect(() => {
        const socket = new SockJS(url); // WebSocket 연결 생성
        const client = Stomp.over(socket);

        client.connect({}, () => {

            // 구독 설정
            client.subscribe(topic, (message) => {
                const parsedMessage = JSON.parse(message.body);
                setMessages((prev) => [...prev, parsedMessage]); // 메시지 저장
            });
        });

        setStompClient(client);

        return () => {
            // 컴포넌트 언마운트 시 WebSocket 연결 해제
            if (client) client.disconnect();
        };
    }, [url, topic]);

    const sendMessage = (destination, body) => {
        if (stompClient) {
            stompClient.send(destination, {}, JSON.stringify(body));
        }
    };

    return { messages, sendMessage };
};

export default useWebSocket;
