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

export interface BookmarkRequest {
    sport: string;
    fullReference: string;
    articleId: number;
}

export interface CallLogRequest {
    sport: string;
    team: string;
    penaltyName: string;
    ruleReference: string;
    controversyLevel: number;
    notes: string;
    isPublic: boolean;
}

export interface RuleDto {
    id: number;
    sport: string;
    ruleNumber: number;
    ruleTitle: string;
    sectionNumber: number;
    sectionTitle: string;
    articleNumber: number;
    articleText: string;
    fullReference: string;
}

export interface CommunityCallDto {
    id: number;
    sport: string;
    team: string;
    penaltyName: string;
    ruleReference: string;
    originalControversy: number;
    notes: string;
    userName: string;
    timestamp: string;
    averageRating: number;
    voteCount: number;
}
