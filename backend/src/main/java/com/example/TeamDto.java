package com.example;

public class TeamDto {
    public Long id;
    public String name;
    public String location;
    public String abbreviation;
    public String sportName;

    public static TeamDto fromEntity(Team team) {
        TeamDto dto = new TeamDto();
        dto.id = team.getId();
        dto.name = team.getName();
        dto.location = team.getLocation();
        dto.abbreviation = team.getAbbreviation();
        dto.sportName = team.getSport().getName();
        return dto;
    }
}
