package com.taskmanager.controller;

import com.taskmanager.dto.TaskCreateRequest;
import com.taskmanager.dto.TaskUpdateRequest;
import com.taskmanager.model.Task;
import com.taskmanager.repository.TaskRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository taskRepository;

    public TaskController(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(taskRepository.findAllByOrderByIdAsc());
    }

    @PostMapping
    public ResponseEntity<?> createTask(@Valid @RequestBody TaskCreateRequest request) {
        if (!request.isStatusValid()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Statut invalide. Les statuts acceptés sont : " + String.join(", ", TaskCreateRequest.VALID_STATUSES));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        String initialStatus = request.getStatus() != null && !request.getStatus().isBlank()
                ? request.getStatus()
                : "à faire";

        Task task = new Task(request.getTitle().trim(), request.getDescription(), initialStatus);
        Task savedTask = taskRepository.save(task);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTask);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable Long id, @RequestBody TaskUpdateRequest request) {
        Optional<Task> optionalTask = taskRepository.findById(id);
        if (optionalTask.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Tâche non trouvée");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        if (request.getTitle() != null && request.getTitle().trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Le titre ne peut pas être vide");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        if (!request.isStatusValid()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Statut invalide. Les statuts acceptés sont : " + String.join(", ", TaskUpdateRequest.VALID_STATUSES));
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        Task task = optionalTask.get();
        if (request.getTitle() != null) {
            task.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription().trim());
        }
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }

        Task updatedTask = taskRepository.save(task);
        return ResponseEntity.ok(updatedTask);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        Optional<Task> optionalTask = taskRepository.findById(id);
        if (optionalTask.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Tâche non trouvée");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        taskRepository.delete(optionalTask.get());
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Tâche supprimée avec succès");
        response.put("task", optionalTask.get());
        return ResponseEntity.ok(response);
    }
}
