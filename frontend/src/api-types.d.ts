/* tslint:disable */
/* eslint-disable */

export interface AuthRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    error: string;
}
