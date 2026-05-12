package com.example;

public class BookmarkDto {
    public String sport;
    public String fullReference;
    public Long articleId;

    public BookmarkDto(String sport, String fullReference, Long articleId) {
        this.sport = sport;
        this.fullReference = fullReference;
        this.articleId = articleId;
    }

    // Default constructor for Jackson
    public BookmarkDto() {}
}
