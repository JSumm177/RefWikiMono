package com.example;

public class ProfileDto {
    public Long userId;
    public String email;
    public String displayName;
    public String homeTeam;
    public String roleType;
    public Integer reputationScore;
    public String bio;

    public static ProfileDto fromEntity(UserProfile profile) {
        ProfileDto dto = new ProfileDto();
        dto.userId = profile.getUser().getId();
        dto.email = profile.getUser().getEmail();
        dto.displayName = profile.getDisplayName();
        dto.homeTeam = profile.getHomeTeam();
        dto.roleType = profile.getRoleType();
        dto.reputationScore = profile.getReputationScore();
        dto.bio = profile.getBio();
        return dto;
    }
}
