package com.example;

public class CommentDto {
    public Long id;
    public String userName;
    public String text;
    public String createdAt;

    public static CommentDto fromEntity(Comment comment) {
        CommentDto dto = new CommentDto();
        dto.id = comment.getId();
        dto.userName = comment.getUser().getEmail().split("@")[0];
        dto.text = comment.getText();
        dto.createdAt = comment.getCreatedAt().toString();
        return dto;
    }
}
