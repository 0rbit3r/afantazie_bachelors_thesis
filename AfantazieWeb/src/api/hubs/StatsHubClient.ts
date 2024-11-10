import * as signalR from "@microsoft/signalr";
import { StatsResponseDto } from "../dto/chat/StatsResponse";


export function connectToStatsHub(handleMessage: (message: StatsResponseDto) => void) {
    const hubUrl = import.meta.env.VITE_LANGUAGE === 'cz'
        ? import.meta.env.VITE_AFANTAZIE_URL + import.meta.env.VITE_HUB_PATH + "/stats"
        : import.meta.env.VITE_THOUGHTWEB_URL + import.meta.env.VITE_HUB_PATH + "/stats";
        
    let connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl)
        .configureLogging(signalR.LogLevel.None)
        // .configureLogging(signalR.LogLevel.Debug)
        .build();

    connection.on("ReceiveStats", data => {
        handleMessage(data as StatsResponseDto);
    });
    
    connection.start();

    function closeConnection() {
        connection.stop();
    }

    return {
        closeConnection,
    };
}