export interface PingResult {
    pong: boolean;
}

export function ping(): PingResult {
    return { pong: true };
}