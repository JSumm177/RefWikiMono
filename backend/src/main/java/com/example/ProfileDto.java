package com.example;

import java.util.Map;
import java.util.HashMap;

public class ProfileDto {
    public Long userId;
    public String email;
    public String displayName;
    public Map<String, String> homeTeams = new HashMap<>(); // Sport Name -> Team Name
    public String roleType;
    public Integer reputationScore;
    public String bio;

    public static ProfileDto fromEntity(UserProfile profile, Map<String, String> teams) {
        ProfileDto dto = new ProfileDto();
        dto.userId = profile.getUser().getId();
        dto.email = profile.getUser().getEmail();
        dto.displayName = profile.getDisplayName();
        dto.homeTeams = teams;
        dto.roleType = profile.getRoleType();
        dto.reputationScore = profile.getReputationScore();
        dto.bio = profile.getBio();
        return dto;
    }
}
