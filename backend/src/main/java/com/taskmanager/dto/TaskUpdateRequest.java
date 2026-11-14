package com.taskmanager.dto;

import java.util.Arrays;
import java.util.List;

public class TaskUpdateRequest {

    public static final List<String> VALID_STATUSES = Arrays.asList("à faire", "en cours", "terminée");

    private String title;
    private String description;
    private String status;

    public TaskUpdateRequest() {
    }

    public TaskUpdateRequest(String title, String description, String status) {
        this.title = title;
        this.description = description;
        this.status = status;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isStatusValid() {
        return status == null || VALID_STATUSES.contains(status);
    }
}
