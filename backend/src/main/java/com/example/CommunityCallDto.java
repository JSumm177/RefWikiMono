package com.example;

import java.time.LocalDateTime;

public class CommunityCallDto {
    public Long id;
    public String sport;
    public String team;
    public String penaltyName;
    public String ruleReference;
    public Integer originalControversy;
    public String notes;
    public String userName;
    public String timestamp;
    public Double averageRating;
    public Long voteCount;
    public Long commentCount;

    public static CommunityCallDto fromEntity(CallLog call, Double avg, Long count, Long comments) {
        CommunityCallDto dto = new CommunityCallDto();
        dto.id = call.getId();
        dto.sport = call.getSport();
        dto.team = call.getTeam();
        dto.penaltyName = call.getPenaltyName();
        dto.ruleReference = call.getRuleReference();
        dto.originalControversy = call.getControversyLevel();
        dto.notes = call.getNotes();
        dto.userName = call.getUser().getEmail().split("@")[0]; // Privacy: only show first part of email
        dto.timestamp = call.getTimestamp().toString();
        dto.averageRating = avg != null ? avg : call.getControversyLevel().doubleValue();
        dto.voteCount = count;
        dto.commentCount = comments;
        return dto;
    }
}
