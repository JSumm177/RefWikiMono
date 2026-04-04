/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 3.2.1263 on 2026-04-04 12:24:04.

export interface AuthRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    error: string;
}

export interface ApiResponse {
    message: string;
    data: string;
    error: string;
}
