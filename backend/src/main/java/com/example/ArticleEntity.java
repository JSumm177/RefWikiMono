package com.example;

import jakarta.persistence.*;

@Entity
@Table(name = "articles")
public class ArticleEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "section_id", nullable = false)
    private SectionEntity section;

    @Column(name = "article_number", nullable = false)
    private Integer articleNumber;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String text;

    public ArticleEntity() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public SectionEntity getSection() { return section; }
    public void setSection(SectionEntity section) { this.section = section; }
    public Integer getArticleNumber() { return articleNumber; }
    public void setArticleNumber(Integer articleNumber) { this.articleNumber = articleNumber; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
}
