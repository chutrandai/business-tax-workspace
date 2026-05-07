package com.business.tax.repository;

import com.business.tax.entity.BoRoleFunctionMap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BoRoleFunctionMapRepository extends JpaRepository<BoRoleFunctionMap, Long> {
    List<BoRoleFunctionMap> findByRoleId(Long roleId);
    List<BoRoleFunctionMap> findByFunctionId(Long functionId);
    boolean existsByRoleIdAndFunctionId(Long roleId, Long functionId);
}