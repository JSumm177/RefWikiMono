package com.example;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "sports")
public class Sport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @OneToMany(mappedBy = "sport", cascade = CascadeType.ALL)
    private List<Rulebook> rulebooks;

    public Sport() {}
    public Sport(String name) { this.name = name; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public List<Rulebook> getRulebooks() { return rulebooks; }
    public void setRulebooks(List<Rulebook> rulebooks) { this.rulebooks = rulebooks; }
}
