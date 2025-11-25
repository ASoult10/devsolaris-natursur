package springboot.devsolaris_backend.orders;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrdersRepository extends JpaRepository<Order, Integer> {

    List<Order> findByUserId(Long userId);

    // Optional: find all orders ordered by date
    List<Order> findAllByOrderByTimestampDesc();
}