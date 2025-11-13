package springboot.devsolaris_backend.baseEntity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.SequenceGenerator;
import lombok.Getter;
import lombok.Setter;

@MappedSuperclass
@Getter
@Setter
public class BaseEntity {

	@Id
	@SequenceGenerator(name = "entity_seq", 
        sequenceName = "entity_sequence", 
        initialValue = 100)
	@GeneratedValue(strategy = GenerationType.SEQUENCE	, generator = "entity_seq")
	protected Integer id;

	@JsonIgnore
	public boolean isNew() {
		return this.id == null;
	}

}
