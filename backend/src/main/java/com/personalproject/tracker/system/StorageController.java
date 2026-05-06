package com.personalproject.tracker.system;

import com.mongodb.client.MongoDatabase;
import java.util.Objects;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/system")
public class StorageController {

    private final MongoDatabaseFactory databaseFactory;
    private final long storageQuotaBytes;

    public StorageController(
            MongoDatabaseFactory databaseFactory,
            @Value("${app.storage-quota-bytes:536870912}") long storageQuotaBytes
    ) {
        this.databaseFactory = databaseFactory;
        this.storageQuotaBytes = storageQuotaBytes;
    }

    @GetMapping("/storage")
    public StorageUsageResponse getStorageUsage() {
        MongoDatabase database = databaseFactory.getMongoDatabase();
        Document stats = database.runCommand(new Document("dbStats", 1).append("scale", 1));

        long storageSize = extractLong(stats, "storageSize");
        long indexSize = extractLong(stats, "indexSize");
        long usedBytes = Math.max(0, storageSize + indexSize);
        long totalBytes = Math.max(1, storageQuotaBytes);
        double usedPercentage = Math.min(100.0, (usedBytes * 100.0) / (double) totalBytes);

        return new StorageUsageResponse(usedBytes, totalBytes, usedPercentage);
    }

    private long extractLong(Document document, String fieldName) {
        Object value = document.get(fieldName);
        if (value instanceof Number number) {
            return number.longValue();
        }
        return 0L;
    }

    public record StorageUsageResponse(long usedBytes, long totalBytes, double usedPercentage) {
    }
}
