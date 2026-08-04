/**
 * @file lab04_ipc_pipes_shared_memory.c
 * @brief Inter-Process Communication (IPC) using Anonymous Pipes and Shared Memory Simulation
 * @author Nimma Lokesh Reddy (ID: 2520030366)
 * @course Operating Systems & Systems Programming (OSSP) | Section S-06
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define BUFFER_SIZE 256

typedef struct {
    char data[BUFFER_SIZE];
    int flag;
} SharedMemoryBuffer;

void simulate_pipe_ipc() {
    printf("\n--- Simulating Pipe Inter-Process Communication ---\n");
    char pipe_buffer[BUFFER_SIZE];
    const char *message = "Hello from Writer Process via IPC Pipe!";
    
    printf("[Writer Process] Writing message to IPC Pipe: '%s'\n", message);
    strncpy(pipe_buffer, message, BUFFER_SIZE - 1);

    printf("[Reader Process] Reading message from IPC Pipe...\n");
    printf("[Reader Process] Message Received: '%s'\n", pipe_buffer);
}

void simulate_shared_memory_ipc() {
    printf("\n--- Simulating Shared Memory IPC ---\n");
    SharedMemoryBuffer shm;
    shm.flag = 0; // 0 = empty, 1 = written

    printf("[Process A] Attaching to Shared Memory Segment...\n");
    strcpy(shm.data, "BlackPanther OS Kernel IPC Payload");
    shm.flag = 1;
    printf("[Process A] Wrote to Shared Memory: '%s'\n", shm.data);

    printf("[Process B] Attaching to Shared Memory Segment...\n");
    if (shm.flag == 1) {
        printf("[Process B] Read from Shared Memory: '%s'\n", shm.data);
    }
}

int main() {
    printf("==================================================\n");
    printf("  OS Lab 04: Inter-Process Communication (IPC)\n");
    printf("  Student: Nimma Lokesh Reddy | ID: 2520030366\n");
    printf("==================================================\n");

    simulate_pipe_ipc();
    simulate_shared_memory_ipc();

    return 0;
}
