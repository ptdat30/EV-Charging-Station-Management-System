// FILE: RabbitMQConfig.java (trong notification-service)
package com.notificationservice.configs;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange; // Sử dụng TopicExchange linh hoạt hơn
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter; // Dùng JSON converter
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${app.rabbitmq.exchange}")
    private String exchangeName;

    @Value("${app.rabbitmq.queue}")
    private String queueName;

    // Bean để định nghĩa Exchange
    @Bean
    TopicExchange exchange() {
        // TopicExchange linh hoạt hơn FanoutExchange
        return new TopicExchange(exchangeName);
    }

    // Bean để định nghĩa Queue
    @Bean
    Queue queue() {
        // Queue bền vững (durable=true), không bị mất khi broker restart
        return new Queue(queueName, true);
    }

    // Bean để định nghĩa Binding (liên kết Exchange với Queue)
    @Bean
    Binding binding(Queue queue, TopicExchange exchange) {
        // Liên kết queue với exchange, nhận tất cả message (routing key là #)
        return BindingBuilder.bind(queue).to(exchange).with("#");
        // Hoặc bạn có thể dùng routing key cụ thể, ví dụ: "session.started"
        // return BindingBuilder.bind(queue).to(exchange).with("session.*");
    }

    // Bean để cấu hình sử dụng JSON cho message thay vì Java serialization mặc định
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}