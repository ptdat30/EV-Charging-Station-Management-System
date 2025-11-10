// FILE: PackageRepository.java
package com.userservice.repositories;

import com.userservice.entities.Package;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PackageRepository extends JpaRepository<Package, Long> {
    Optional<Package> findByPackageType(Package.PackageType packageType);
    List<Package> findByIsActive(Boolean isActive);
    List<Package> findAllByOrderByPriceAsc();
}

