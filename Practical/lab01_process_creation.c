/**
 * @file lab01_process_creation.c
 * @brief Process Management in Operating Systems using fork(), exec(), wait(), and PID calls.
 * @author Nimma Lokesh Reddy (ID: 2520030366)
 * @course Operating Systems & Systems Programming (OSSP) | Section S-06
 */

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>

int main() {
    pid_t pid;
    int status;

    printf("==================================================\n");
    printf("  OS Lab 01: Process Creation & Management Demonstration\n");
    printf("  Student: Nimma Lokesh Reddy | ID: 2520030366\n");
    printf("==================================================\n\n");

    printf("[Parent] Initializing parent process with PID: %d\n", getpid());
    printf("[Parent] Forking child process...\n");

    pid = fork();

    if (pid < 0) {
        perror("[Error] Fork failed");
        exit(EXIT_FAILURE);
    } 
    else if (pid == 0) {
        // Child Process
        printf("\n  [Child] Child process executed successfully!\n");
        printf("  [Child] Child PID: %d, Parent PID: %d\n", getpid(), getppid());
        printf("  [Child] Executing system utility '/bin/ls'...\n");
        
        char *args[] = {"ls", "-l", NULL};
        execvp(args[0], args);
        
        // If execvp returns, an error occurred
        perror("  [Child Error] Exec failed");
        exit(EXIT_FAILURE);
    } 
    else {
        // Parent Process
        printf("[Parent] Waiting for child process (PID: %d) to complete...\n", pid);
        waitpid(pid, &status, 0);
        
        if (WIFEXITED(status)) {
            printf("[Parent] Child process terminated normally with exit status: %d\n", WEXITSTATUS(status));
        } else {
            printf("[Parent] Child process terminated abnormally.\n");
        }
        
        printf("[Parent] Process hierarchy demonstration finished.\n");
    }

    return 0;
}
