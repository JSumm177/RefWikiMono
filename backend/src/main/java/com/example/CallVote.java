package com.example;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "call_votes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"call_id", "user_id"})
})
public class CallVote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "call_id", nullable = false)
    private CallLog call;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer rating;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public CallVote() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public CallLog getCall() { return call; }
    public void setCall(CallLog call) { this.call = call; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
