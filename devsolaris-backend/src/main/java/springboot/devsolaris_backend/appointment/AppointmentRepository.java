package springboot.devsolaris_backend.appointment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import springboot.devsolaris_backend.user.User;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    
    List<Appointment> findByUserOrderByStartTimeAsc(User user);
    
    List<Appointment> findByUserIdOrderByStartTimeAsc(Integer userId);
    
    List<Appointment> findAllByOrderByStartTimeAsc();
    
    List<Appointment> findByStartTimeBetweenOrderByStartTimeAsc(LocalDateTime startDate, LocalDateTime endDate);
    
    List<Appointment> findByStartTimeGreaterThanEqualOrderByStartTimeAsc(LocalDateTime startDate);
    
    List<Appointment> findByStartTimeLessThanEqualOrderByStartTimeAsc(LocalDateTime endDate);
    
    @Query("SELECT a FROM Appointment a WHERE " +
           "(a.startTime < :endTime AND a.endTime > :startTime)")
    List<Appointment> findOverlappingAppointments(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);
    
    @Query("SELECT a FROM Appointment a WHERE " +
           "a.id != :appointmentId AND " +
           "(a.startTime < :endTime AND a.endTime > :startTime)")
    List<Appointment> findOverlappingAppointmentsExcludingId(
            @Param("appointmentId") Integer appointmentId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);
}
