export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    images?: string[];
}

export interface QueryResponse {
    answer: string;
    images?: string[];
} 