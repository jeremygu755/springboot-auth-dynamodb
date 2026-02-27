package com.auth.repository;

import com.auth.model.Role;
import com.auth.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;

import java.util.Map;
import java.util.Optional;

@Repository
public class UserRepository {

    private final DynamoDbClient dynamoDbClient;
    private final String tableName;

    public UserRepository(DynamoDbClient dynamoDbClient,
                          @Value("${aws.dynamodb.table-name}") String tableName) {
        this.dynamoDbClient = dynamoDbClient;
        this.tableName = tableName;
    }

    public void save(User user) {
        PutItemRequest request = PutItemRequest.builder()
                .tableName(tableName)
                .item(Map.of(
                        "email",    AttributeValue.fromS(user.getEmail()),
                        "id",       AttributeValue.fromS(user.getId()),
                        "name",     AttributeValue.fromS(user.getName()),
                        "password", AttributeValue.fromS(user.getPassword()),
                        "role",     AttributeValue.fromS(user.getRole().name())
                ))
                .build();

        dynamoDbClient.putItem(request);
    }

    public Optional<User> findByEmail(String email) {
        GetItemRequest request = GetItemRequest.builder()
                .tableName(tableName)
                .key(Map.of("email", AttributeValue.fromS(email)))
                .build();

        GetItemResponse response = dynamoDbClient.getItem(request);

        if (!response.hasItem() || response.item().isEmpty()) {
            return Optional.empty();
        }

        Map<String, AttributeValue> item = response.item();
        User user = new User(
                item.get("id").s(),
                item.get("name").s(),
                item.get("email").s(),
                item.get("password").s(),
                Role.valueOf(item.get("role").s())
        );

        return Optional.of(user);
    }

    public boolean existsByEmail(String email) {
        return findByEmail(email).isPresent();
    }
}
