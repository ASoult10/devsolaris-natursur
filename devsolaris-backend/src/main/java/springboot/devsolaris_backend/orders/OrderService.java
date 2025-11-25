package springboot.devsolaris_backend.order;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import springboot.devsolaris_backend.auth.AuthenticationUtil;
import springboot.devsolaris_backend.auth.Role;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class OrderService {

    private final OrdersRepository ordersRepository;

    // === CREATE ORDER ===
    public Order createOrder(Order order) {
        // Users can only create orders for themselves unless admin
        validateUserAccess(order.getUserId());

        return ordersRepository.save(order);
    }

    // === GET ALL ORDERS (ADMIN ONLY) ===
    public List<Order> getAllOrders() {
        validateAdminAccess();
        return ordersRepository.findAll();
    }

    // === GET ORDER BY ID ===
    public Order getOrderById(Integer id) {
        Order order = ordersRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Orden con ID " + id + " no encontrada"));

        validateUserAccess(order.getUserId());

        return order;
    }

    // === DELETE ORDER ===
    public void deleteOrder(Integer id) {
        Order order = ordersRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Orden con ID " + id + " no encontrada"));

        validateUserAccess(order.getUserId());

        ordersRepository.delete(order);
    }

    // === HELPER METHODS ===

    private void validateAdminAccess() {
        if (!AuthenticationUtil.isAdmin()) {
            throw new IllegalArgumentException(
                "No tienes permisos para esta operación. Solo administradores pueden acceder."
            );
        }
    }

    private void validateUserAccess(Long userIdFromOrder) {
        Long currentUserId = Long.valueOf(AuthenticationUtil.getCurrentUserId());
        boolean isAdmin = AuthenticationUtil.isAdmin();

        if (!isAdmin && !currentUserId.equals(userIdFromOrder)) {
            throw new IllegalArgumentException(
                "No tienes permisos para acceder a esta orden. Solo puedes acceder a tus propias órdenes."
            );
        }
    }
}
