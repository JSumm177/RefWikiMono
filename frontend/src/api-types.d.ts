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
    userRole: string;
    timestamp: string;
    averageRating: number;
    voteCount: number;
    commentCount: number;
}

export interface CommentDto {
    id: number;
    userName: string;
    userRole: string;
    text: string;
    createdAt: string;
}

export interface CommentRequest {
    text: string;
}

export interface ProfileDto {
    userId: number;
    email: string;
    displayName: string;
    homeTeams: { [index: string]: string };
    roleType: string;
    reputationScore: number;
    bio: string;
}

export interface BookmarkDto {
    sport: string;
    fullReference: string;
    articleId: number;
}

export interface UserAccuracyDto {
    userId: number;
    userName: string;
    roleType: string;
    accuracyRate: number;
    totalActions: number;
}
