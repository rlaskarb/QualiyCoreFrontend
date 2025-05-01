import React, { useState, useEffect, createContext } from "react";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export const WebsocketContext = createContext();

export const WebsocketProvider = ({ children }) => {
    // 게시판 알림 상태
    const [messages, setMessages] = useState(() => {
        const savedMessages = localStorage.getItem('boardNotifications');
        return savedMessages ? JSON.parse(savedMessages) : [];
    });

    // 작업지시서 알림 상태 ➕
    const [workOrderMessages, setWorkOrderMessages] = useState(() => {
        const savedWorkOrders = localStorage.getItem('workOrderNotifications');
        return savedWorkOrders ? JSON.parse(savedWorkOrders) : [];
    });

    useEffect(() => {
        const socket = new SockJS("http://localhost:8080/ws");
        const stompClient = Stomp.over(socket);

        console.log("✅ WebSocket 인스턴스 생성 완료");

        const reconnect = () => {
            setTimeout(() => {
                console.log('🔁 재연결 시도');
                stompClient.connect({}, successCallback, errorCallback);
            }, 10000);
        };

        const successCallback = () => {
            console.log("🔥 WebSocket 연결 성공! 구독 시작");

            // 게시판 알림 구독
            stompClient.subscribe("/topic/newPosts", (message) => {
                console.log("📌 [게시판] 수신 데이터:", message.body);
                const newMessage = JSON.parse(message.body);
                setMessages(prev => {
                    const updated = [...prev, newMessage];
                    localStorage.setItem('boardNotifications', JSON.stringify(updated));
                    console.log(`📥 게시판 알림 업데이트 (현재 개수: ${updated.length})`);
                    return updated;
                });
            });

            // 작업지시서 알림 구독
            stompClient.subscribe("/topic/workOrders", (message) => {
                console.log("📌 [작업지시] 수신 데이터:", message.body);
                const newWorkOrder = JSON.parse(message.body);
                setWorkOrderMessages(prev => {
                    const updated = [...prev, newWorkOrder];
                    localStorage.setItem('workOrderNotifications', JSON.stringify(updated));
                    console.log(`📥 작업지시 알림 업데이트 (현재 개수: ${updated.length})`);
                    return updated;
                });
            });
        };

        const errorCallback = (error) => {
            console.error('🔴 연결 실패:', error);
            reconnect();
        };

        stompClient.connect({}, successCallback, errorCallback);

        // STOMP 디버그 메시지 활성화 (기본 제공 기능)
        stompClient.debug = (msg) => console.log("🔍 STOMP 로그:", msg);

        return () => {
            console.log("❌ WebSocket 연결 종료");
            stompClient.disconnect();
        };
    }, []);

    // 게시판 알림 초기화
    const resetNotifications = () => {
        setMessages([]);
        localStorage.removeItem('boardNotifications');
    };

    // 작업지시서 알림 초기화 ➕
    const resetWorkOrderNotifications = () => {
        setWorkOrderMessages([]);
        localStorage.removeItem('workOrderNotifications');
    };

    return (
        <WebsocketContext.Provider
            value={{
                messages,
                setMessages,
                workOrderMessages, // ➕
                setWorkOrderMessages,
                resetNotifications,
                resetWorkOrderNotifications // ➕
            }}
        >
            {children}
        </WebsocketContext.Provider>
    );
};
