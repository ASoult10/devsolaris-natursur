package springboot.devsolaris_backend.appointment;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import springboot.devsolaris_backend.baseEntity.BaseEntity;
import springboot.devsolaris_backend.user.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@NoArgsConstructor
public class Appointment extends BaseEntity {

    @NotNull(message = "El usuario es obligatorio")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull(message = "La fecha de inicio es obligatoria")
    @Column(nullable = false)
    private LocalDateTime startTime;

    @NotNull(message = "La fecha de fin es obligatoria")
    @Column(nullable = false)
    private LocalDateTime endTime;

    @Column(length = 500)
    private String title;

    @Column(length = 1000)
    private String description;

    public Appointment(User user, LocalDateTime startTime, LocalDateTime endTime, String title, String description) {
        this.user = user;
        this.startTime = startTime;
        this.endTime = endTime;
        this.title = title;
        this.description = description;
    }

    @Override
    public String toString() {
        return "Appointment{" +
                "id=" + getId() +
                ", user=" + user.getName() +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                '}';
    }
}
