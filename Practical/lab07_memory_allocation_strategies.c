/**
 * @file lab07_memory_allocation_strategies.c
 * @brief Contiguous Memory Allocation Strategies: First-Fit, Best-Fit, Worst-Fit
 * @author Nimma Lokesh Reddy (ID: 2520030366)
 * @course Operating Systems & Systems Programming (OSSP) | Section S-06
 */

#include <stdio.h>
#include <string.h>

#define MAX_BLOCKS 5
#define MAX_PROCESSES 4

void first_fit(int blocks[], int m, int processes[], int n) {
    int allocation[MAX_PROCESSES];
    memset(allocation, -1, sizeof(allocation));

    int temp_blocks[MAX_BLOCKS];
    for (int i = 0; i < m; i++) temp_blocks[i] = blocks[i];

    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            if (temp_blocks[j] >= processes[i]) {
                allocation[i] = j;
                temp_blocks[j] -= processes[i];
                break;
            }
        }
    }

    printf("\n--- First-Fit Memory Allocation ---\n");
    printf("Process No.\tProcess Size\tBlock No.\n");
    for (int i = 0; i < n; i++) {
        printf("%d\t\t%d KB\t\t", i + 1, processes[i]);
        if (allocation[i] != -1)
            printf("%d\n", allocation[i] + 1);
        else
            printf("Not Allocated\n");
    }
}

void best_fit(int blocks[], int m, int processes[], int n) {
    int allocation[MAX_PROCESSES];
    memset(allocation, -1, sizeof(allocation));

    int temp_blocks[MAX_BLOCKS];
    for (int i = 0; i < m; i++) temp_blocks[i] = blocks[i];

    for (int i = 0; i < n; i++) {
        int best_idx = -1;
        for (int j = 0; j < m; j++) {
            if (temp_blocks[j] >= processes[i]) {
                if (best_idx == -1 || temp_blocks[j] < temp_blocks[best_idx]) {
                    best_idx = j;
                }
            }
        }
        if (best_idx != -1) {
            allocation[i] = best_idx;
            temp_blocks[best_idx] -= processes[i];
        }
    }

    printf("\n--- Best-Fit Memory Allocation ---\n");
    printf("Process No.\tProcess Size\tBlock No.\n");
    for (int i = 0; i < n; i++) {
        printf("%d\t\t%d KB\t\t", i + 1, processes[i]);
        if (allocation[i] != -1)
            printf("%d\n", allocation[i] + 1);
        else
            printf("Not Allocated\n");
    }
}

int main() {
    int blocks[] = {100, 500, 200, 300, 600};
    int processes[] = {212, 417, 112, 426};
    int m = 5, n = 4;

    printf("==================================================\n");
    printf("  OS Lab 07: Memory Allocation Strategies\n");
    printf("  Student: Nimma Lokesh Reddy | ID: 2520030366\n");
    printf("==================================================\n");

    first_fit(blocks, m, processes, n);
    best_fit(blocks, m, processes, n);

    return 0;
}
