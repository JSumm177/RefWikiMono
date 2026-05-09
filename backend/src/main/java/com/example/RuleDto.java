package com.example;

public class RuleDto {
    public Long id;
    public String sport;
    public Integer ruleNumber;
    public String ruleTitle;
    public Integer sectionNumber;
    public String sectionTitle;
    public Integer articleNumber;
    public String articleText;
    public String fullReference;

    public static RuleDto fromArticle(ArticleEntity article) {
        RuleDto dto = new RuleDto();
        dto.id = article.getId();
        dto.sport = article.getSection().getRule().getRulebook().getSport().getName();
        dto.ruleNumber = article.getSection().getRule().getRuleNumber();
        dto.ruleTitle = article.getSection().getRule().getTitle();
        dto.sectionNumber = article.getSection().getSectionNumber();
        dto.sectionTitle = article.getSection().getTitle();
        dto.articleNumber = article.getArticleNumber();
        dto.articleText = article.getText();
        dto.fullReference = String.format("Rule %d, Section %d, Article %d", dto.ruleNumber, dto.sectionNumber, dto.articleNumber);
        return dto;
    }
}
