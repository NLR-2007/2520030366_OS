/**
 * @file lab06_bankers_algorithm_deadlock.c
 * @brief Deadlock Avoidance using Dijkstra's Banker's Algorithm
 * @author Nimma Lokesh Reddy (ID: 2520030366)
 * @course Operating Systems & Systems Programming (OSSP) | Section S-06
 */

#include <stdio.h>
#include <stdbool.h>

#define P 5 // Number of processes
#define R 3 // Number of resource types

void calculate_need(int need[P][R], int max[P][R], int alloc[P][R]) {
    for (int i = 0; i < P; i++) {
        for (int j = 0; j < R; j++) {
            need[i][j] = max[i][j] - alloc[i][j];
        }
    }
}

bool is_safe_state(int processes[], int avail[], int max[][R], int alloc[][R]) {
    int need[P][R];
    calculate_need(need, max, alloc);

    bool finish[P] = {0};
    int safe_seq[P];
    int work[R];

    for (int i = 0; i < R; i++) work[i] = avail[i];

    int count = 0;
    while (count < P) {
        bool found = false;
        for (int p = 0; p < P; p++) {
            if (!finish[p]) {
                int j;
                for (j = 0; j < R; j++) {
                    if (need[p][j] > work[j]) break;
                }
                if (j == R) {
                    for (int k = 0; k < R; k++) work[k] += alloc[p][k];
                    safe_seq[count++] = p;
                    finish[p] = true;
                    found = true;
                }
            }
        }
        if (!found) {
            printf("\n[System Alert] System is NOT in a safe state! Deadlock detected.\n");
            return false;
        }
    }

    printf("\n[System State] System IS in a SAFE state.\nSafe Sequence: ");
    for (int i = 0; i < P; i++) {
        printf("P%d ", safe_seq[i]);
    }
    printf("\n");
    return true;
}

int main() {
    int processes[] = {0, 1, 2, 3, 4};
    int avail[] = {3, 3, 2};
    int max[P][R] = {
        {7, 5, 3},
        {3, 2, 2},
        {9, 0, 2},
        {2, 2, 2},
        {4, 3, 3}
    };
    int alloc[P][R] = {
        {0, 1, 0},
        {2, 0, 0},
        {3, 0, 2},
        {2, 1, 1},
        {0, 0, 2}
    };

    printf("==================================================\n");
    printf("  OS Lab 06: Banker's Algorithm for Deadlock Avoidance\n");
    printf("  Student: Nimma Lokesh Reddy | ID: 2520030366\n");
    printf("==================================================\n");

    is_safe_state(processes, avail, max, alloc);

    return 0;
}
