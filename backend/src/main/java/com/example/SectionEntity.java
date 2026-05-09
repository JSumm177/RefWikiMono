package com.example;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "sections")
public class SectionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "rule_id", nullable = false)
    private RuleEntity rule;

    @Column(name = "section_number", nullable = false)
    private Integer sectionNumber;

    @Column(nullable = false)
    private String title;

    @OneToMany(mappedBy = "section", cascade = CascadeType.ALL)
    private List<ArticleEntity> articles;

    public SectionEntity() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public RuleEntity getRule() { return rule; }
    public void setRule(RuleEntity rule) { this.rule = rule; }
    public Integer getSectionNumber() { return sectionNumber; }
    public void setSectionNumber(Integer sectionNumber) { this.sectionNumber = sectionNumber; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public List<ArticleEntity> getArticles() { return articles; }
    public void setArticles(List<ArticleEntity> articles) { this.articles = articles; }
}
