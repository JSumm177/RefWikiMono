package com.example;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "rules")
public class RuleEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "rulebook_id", nullable = false)
    private Rulebook rulebook;

    @Column(name = "rule_number", nullable = false)
    private Integer ruleNumber;

    @Column(nullable = false)
    private String title;

    @OneToMany(mappedBy = "rule", cascade = CascadeType.ALL)
    private List<SectionEntity> sections;

    public RuleEntity() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Rulebook getRulebook() { return rulebook; }
    public void setRulebook(Rulebook rulebook) { this.rulebook = rulebook; }
    public Integer getRuleNumber() { return ruleNumber; }
    public void setRuleNumber(Integer ruleNumber) { this.ruleNumber = ruleNumber; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public List<SectionEntity> getSections() { return sections; }
    public void setSections(List<SectionEntity> sections) { this.sections = sections; }
}
