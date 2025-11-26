package springboot.devsolaris_backend.orders;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;

import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import springboot.devsolaris_backend.baseEntity.BaseEntity;

import java.util.Collection;
import java.util.List;

import jakarta.persistence.*;


@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
public class Order extends BaseEntity {

    @Column(nullable = false)
    private Long userId;

    @Column
    private String username;

    @Column
    private String fullName;

    /**
     * RAW JSON STRING containing items array.
     * Example:
     * [
     *   {"product":"Batido","product_id":"A12","cantidad":2},
     *   {"product":"Té","product_id":"B33","cantidad":1}
     * ]
     */
    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String items;

    @NotBlank
    @Column(nullable = false)
    private String timestamp;

    public Order(Long userId, String username, String fullName, String items, String timestamp) {
        this.userId = userId; //TELEGRAM user id
        this.username = username;
        this.fullName = fullName;
        this.items = items;
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "Order{" +
                "id=" + getId() +
                ", userId=" + userId +
                ", username='" + username + '\'' +
                ", fullName='" + fullName + '\'' +
                ", items=" + items +
                ", timestamp='" + timestamp + '\'' +
                '}';
    }
}