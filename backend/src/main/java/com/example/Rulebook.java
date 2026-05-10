package com.example;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "rulebooks")
public class Rulebook {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sport_id", nullable = false)
    private Sport sport;

    @Column(name = "release_year", nullable = false)
    private Integer year;

    @Column(nullable = false)
    private String title;

    @Column(name = "source_url")
    private String sourceUrl;

    @OneToMany(mappedBy = "rulebook", cascade = CascadeType.ALL)
    private List<RuleEntity> rules;

    public Rulebook() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Sport getSport() { return sport; }
    public void setSport(Sport sport) { this.sport = sport; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }
    public List<RuleEntity> getRules() { return rules; }
    public void setRules(List<RuleEntity> rules) { this.rules = rules; }
}
