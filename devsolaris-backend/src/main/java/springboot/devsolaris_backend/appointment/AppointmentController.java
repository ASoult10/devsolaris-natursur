package springboot.devsolaris_backend.appointment;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import springboot.devsolaris_backend.appointment.dto.AppointmentRequest;
import springboot.devsolaris_backend.appointment.dto.AppointmentResponse;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    /**
     * Crear una nueva cita
     * POST /api/appointments
     */
    @PostMapping
    public ResponseEntity<?> createAppointment(@Valid @RequestBody AppointmentRequest request) {
        try {
            AppointmentResponse response = appointmentService.createAppointment(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Error al crear la cita: " + e.getMessage()));
        }
    }

    /**
     * Obtener todas las citas de un usuario
     * GET /api/appointments/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getAppointmentsByUserId(@PathVariable Integer userId) {
        try {
            List<AppointmentResponse> appointments = appointmentService.getAppointmentsByUserId(userId);
            return ResponseEntity.ok(appointments);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Error al obtener las citas: " + e.getMessage()));
        }
    }

    /**
     * Obtener una cita por ID
     * GET /api/appointments/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointmentById(@PathVariable Integer id) {
        try {
            AppointmentResponse appointment = appointmentService.getAppointmentById(id);
            return ResponseEntity.ok(appointment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Error al obtener la cita: " + e.getMessage()));
        }
    }

    /**
     * Actualizar una cita existente
     * PUT /api/appointments/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAppointment(@PathVariable Integer id, 
                                               @Valid @RequestBody AppointmentRequest request) {
        try {
            AppointmentResponse response = appointmentService.updateAppointment(id, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Error al actualizar la cita: " + e.getMessage()));
        }
    }

    /**
     * Eliminar una cita
     * DELETE /api/appointments/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAppointment(@PathVariable Integer id) {
        try {
            appointmentService.deleteAppointment(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Cita eliminada exitosamente");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Error al eliminar la cita: " + e.getMessage()));
        }
    }

    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return error;
    }
}
