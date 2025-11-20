-- Insertar usuarios de ejemplo (password: "password123" para todos)
-- Password hasheado con BCrypt
-- Passwords: password123
INSERT INTO users (id, name, email, phone, password, role) VALUES 
(100, 'Fernando Escalona', 'admin@natursur.com', '612345678', '$2a$10$uH8kMfVBLl16bWqpk0L/4OWl2uVFIfzI9aVUisHr2yxeeCNwMXB/K', 'ADMIN'),
(101, 'Juan Pérez', 'juan.perez@example.com', '623456789', '$2a$10$uH8kMfVBLl16bWqpk0L/4OWl2uVFIfzI9aVUisHr2yxeeCNwMXB/K', 'CLIENT'),
(102, 'María García', 'maria.garcia@example.com', '634567890', '$2a$10$uH8kMfVBLl16bWqpk0L/4OWl2uVFIfzI9aVUisHr2yxeeCNwMXB/K', 'CLIENT');

-- Insertar citas de ejemplo
INSERT INTO appointments (id, user_id, start_time, end_time, title, description) VALUES 
(100, 101, '2024-02-15 10:00:00', '2024-02-15 11:00:00', 'Consulta médica', 'Revisión general anual'),
(101, 101, '2024-02-20 15:30:00', '2024-02-20 16:30:00', 'Seguimiento', 'Control de resultados de análisis'),
(102, 102, '2024-02-18 09:00:00', '2024-02-18 10:00:00', 'Primera consulta', 'Evaluación inicial'),
(103, 102, '2024-02-22 11:00:00', '2024-02-22 12:00:00', 'Tratamiento', 'Sesión de fisioterapia');

-- Actualizar la secuencia para que los próximos IDs sean mayores a los insertados
ALTER SEQUENCE entity_sequence RESTART WITH 200;