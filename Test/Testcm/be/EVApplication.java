package com.quitsmoking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class QuitsmokingApplication {

	public static void main(String[] args) {
		SpringApplication.run(QuitsmokingApplication.class, args);
	}

}
