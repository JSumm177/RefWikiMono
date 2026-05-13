package com.example;

public class UserAccuracyDto {
    public Long userId;
    public String userName;
    public String roleType;
    public Double accuracyRate;
    public Long totalActions;

    public UserAccuracyDto() {}

    public UserAccuracyDto(Long userId, String userName, String roleType, Double accuracyRate, Long totalActions) {
        this.userId = userId;
        this.userName = userName;
        this.roleType = roleType;
        this.accuracyRate = accuracyRate;
        this.totalActions = totalActions;
    }
}
